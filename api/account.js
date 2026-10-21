import bcrypt from "bcrypt";
import { randomInt } from "node:crypto";
import { nicknameStarts, nicknameEnds } from "../public/nickname-words.js";
import { getDatabase } from "./_lib/mongodb.js";
import {
  COLLECTIONS, apiHandler, clearUserCookie, createSession, currentUser, endSession,
  hashToken, newId, postingEnabled, rateIdentity, rateLimit, respond, token, transaction,
} from "./_lib/accounts.js";
import { HttpError, schema, validateNickname, validatePassword, validateSignupNickname } from "./_lib/validation.js";

const suggestedNicknames = nicknameStarts.flatMap((start) => nicknameEnds.map((end) => `${start}-${end}`)).filter((name) => name.length <= 24);

async function availableNickname(db) {
  // Query a batch from a randomized point, without returning existing aliases.
  const offset = randomInt(suggestedNicknames.length);
  for (let checked = 0; checked < suggestedNicknames.length; checked += 128) {
    const batch = Array.from({ length: Math.min(128, suggestedNicknames.length - checked) }, (_, index) => suggestedNicknames[(offset + checked + index) % suggestedNicknames.length]);
    const occupied = await db.collection(COLLECTIONS.users).find({ nicknameKey: { $in: batch.map((name) => name.toLowerCase()) } }, { projection: { nicknameKey: 1, _id: 0 }, maxTimeMS: 3000 }).toArray();
    const keys = new Set(occupied.map((user) => user.nicknameKey));
    const available = batch.find((name) => !keys.has(name.toLowerCase()));
    if (available) return available;
  }
  throw new HttpError(503, "Nickname suggestions are full. Please try again later.");
}

function validateRecoveryCode(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value)) throw new HttpError(400, "Use the private recovery code you saved.");
  return value;
}

let dummyHash;
async function comparePassword(password, user) {
  const hash = user?.passwordHash || await (dummyHash ??= bcrypt.hash(token(), 12));
  return bcrypt.compare(password, hash);
}

export function createAccountHandler(databaseProvider = getDatabase, state) {
  return apiHandler(["GET", "POST", "DELETE"], async (req, res, db, body) => {
    const identity = rateIdentity(req);
    if (req.method === "GET") {
      await rateLimit(db, "account-read", identity, 120, 60_000);
      const mode = new URL(req.url || "/api/account", "http://localhost").searchParams.get("mode");
      if (mode === "nickname") {
        await rateLimit(db, "nickname-suggest", identity, 30, 60_000);
        respond(res, 200, { nickname: await availableNickname(db) });
        return;
      }
      if (mode) throw new HttpError(400, "Choose a supported account action.");
      const user = await currentUser(db, req, false);
      respond(res, 200, { user: user ? { nickname: user.nickname } : null, postingEnabled: await postingEnabled(db) });
      return;
    }

    if (req.method === "DELETE") {
      schema(body, ["password"]);
      const password = validatePassword(body.password);
      await rateLimit(db, "account-delete", identity, 10, 15 * 60_000);
      const user = await currentUser(db, req);
      if (!await comparePassword(password, user)) throw new HttpError(401, "The password is not correct.");
      await transaction(db, async (session) => {
        const result = await db.collection(COLLECTIONS.users).deleteOne({ _id: user._id, passwordHash: user.passwordHash }, { session });
        if (!result.deletedCount) throw new HttpError(401, "Please log in again.");
        await db.collection(COLLECTIONS.posts).deleteMany({ userId: user._id }, { session });
        await db.collection(COLLECTIONS.sessions).deleteMany({ userId: user._id, kind: "user" }, { session });
      });
      clearUserCookie(req, res);
      respond(res, 200, { user: null });
      return;
    }

    if (body.action === "logout") {
      schema(body, ["action"]);
      await rateLimit(db, "account-logout", identity, 30, 60_000);
      await endSession(db, req, res, "user");
      respond(res, 200, { user: null });
      return;
    }
    if (body.action === "recovery-code") {
      schema(body, ["action", "password"]);
      const password = validatePassword(body.password);
      await rateLimit(db, "recovery-issue", identity, 5, 15 * 60_000);
      const user = await currentUser(db, req);
      if (!await comparePassword(password, user)) throw new HttpError(401, "The password is not correct.");
      const recoveryCode = token();
      await rateLimit(db, "recovery-issue-user", user._id, 5, 15 * 60_000);
      let commitCookie;
      await transaction(db, async (session) => {
        const updated = await db.collection(COLLECTIONS.users).updateOne({ _id: user._id, passwordHash: user.passwordHash }, { $set: { recoveryHash: hashToken(recoveryCode) }, $inc: { writeVersion: 1 } }, { session });
        if (!updated.matchedCount) throw new HttpError(401, "Please log in again.");
        await db.collection(COLLECTIONS.sessions).deleteMany({ userId: user._id, kind: "user" }, { session });
        commitCookie = await createSession(db, req, res, "user", user._id, session, true);
      });
      commitCookie();
      respond(res, 200, { recoveryCode });
      return;
    }
    if (body.action === "recover") {
      schema(body, ["action", "nickname", "recoveryCode", "password"]);
      await rateLimit(db, "account-recovery-ip", identity, 10, 15 * 60_000);
      const nickname = validateNickname(body.nickname);
      await rateLimit(db, "account-recovery-alias", nickname.toLowerCase(), 5, 15 * 60_000);
      const password = validatePassword(body.password);
      const recoveryHash = hashToken(validateRecoveryCode(body.recoveryCode));
      const user = await db.collection(COLLECTIONS.users).findOne({ nicknameKey: nickname.toLowerCase(), recoveryHash }, { maxTimeMS: 3000 });
      if (!user) throw new HttpError(401, "That nickname and recovery code did not match.");
      const passwordHash = await bcrypt.hash(password, 12);
      const recoveryCode = token();
      let commitCookie;
      await transaction(db, async (session) => {
        // Conditional write makes a code one-use even for concurrent requests.
        const updated = await db.collection(COLLECTIONS.users).updateOne({ _id: user._id, recoveryHash, passwordHash: user.passwordHash }, { $set: { passwordHash, recoveryHash: hashToken(recoveryCode) }, $inc: { writeVersion: 1 } }, { session });
        if (!updated.matchedCount) throw new HttpError(401, "That nickname and recovery code did not match.");
        await db.collection(COLLECTIONS.sessions).deleteMany({ userId: user._id, kind: "user" }, { session });
        commitCookie = await createSession(db, req, res, "user", user._id, session, true);
      });
      commitCookie();
      respond(res, 200, { user: { nickname: user.nickname }, recoveryCode });
      return;
    }
    if (!["login", "register"].includes(body.action)) throw new HttpError(400, "Choose login, sign up, or logout.");
    schema(body, ["action", "nickname", "password"]);
    const nickname = body.action === "register" ? validateSignupNickname(body.nickname) : validateNickname(body.nickname);
    const password = validatePassword(body.password);
    const nicknameKey = nickname.toLowerCase();
    await rateLimit(db, "account-auth-ip", identity, 30, 15 * 60_000);
    await rateLimit(db, "account-auth-alias", nicknameKey, 10, 15 * 60_000);

    if (body.action === "login") {
      const user = await db.collection(COLLECTIONS.users).findOne({ nicknameKey }, { maxTimeMS: 3000 });
      const valid = await comparePassword(password, user);
      if (!user || !valid) throw new HttpError(401, "That nickname and password did not match.");
      await endSession(db, req, res, "user");
      let commitCookie;
      await transaction(db, async (session) => {
        const unchanged = await db.collection(COLLECTIONS.users).updateOne({ _id: user._id, passwordHash: user.passwordHash }, { $inc: { writeVersion: 1 } }, { session });
        if (!unchanged.matchedCount) throw new HttpError(401, "That nickname and password did not match.");
        commitCookie = await createSession(db, req, res, "user", user._id, session, true);
      });
      commitCookie();
      respond(res, 200, { user: { nickname: user.nickname } });
      return;
    }

    await rateLimit(db, "account-signup-ip", identity, 5, 60 * 60_000);
    const recoveryCode = token();
    const user = { _id: newId(), nickname, nicknameKey, passwordHash: await bcrypt.hash(password, 12), recoveryHash: hashToken(recoveryCode), createdAt: new Date(), writeVersion: 0 };
    let commitCookie;
    try {
      await transaction(db, async (session) => {
        await db.collection(COLLECTIONS.users).insertOne(user, { session });
        commitCookie = await createSession(db, req, res, "user", user._id, session, true);
      });
    } catch (error) {
      if (error?.code === 11000) throw new HttpError(409, "That nickname cannot be used. Try another made-up nickname.");
      throw error;
    }
    commitCookie();
    respond(res, 201, { user: { nickname: user.nickname }, recoveryCode });
  }, databaseProvider, state);
}

export default createAccountHandler();
