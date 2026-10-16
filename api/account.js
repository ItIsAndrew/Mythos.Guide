import bcrypt from "bcrypt";
import { getDatabase } from "./_lib/mongodb.js";
import {
  COLLECTIONS, apiHandler, clearUserCookie, createSession, currentUser, endSession,
  hashToken, newId, postingEnabled, rateIdentity, rateLimit, respond, token, transaction,
} from "./_lib/accounts.js";
import { HttpError, schema, validateInviteCode, validateNickname, validatePassword, validateSignupNickname } from "./_lib/validation.js";

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
    if (!["login", "register"].includes(body.action)) throw new HttpError(400, "Choose login, sign up, or logout.");
    schema(body, body.action === "register" ? ["action", "nickname", "password", "inviteCode"] : ["action", "nickname", "password"]);
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
      await createSession(db, req, res, "user", user._id);
      respond(res, 200, { user: { nickname: user.nickname } });
      return;
    }

    const inviteCode = validateInviteCode(body.inviteCode);
    const inviteId = hashToken(inviteCode);
    const invitation = await db.collection(COLLECTIONS.invites).findOne({ _id: inviteId, expiresAt: { $gt: new Date() } }, { maxTimeMS: 3000 });
    if (!invitation) throw new HttpError(400, "That invitation cannot be used. Ask the owner for a new one.");
    const user = { _id: newId(), nickname, nicknameKey, passwordHash: await bcrypt.hash(password, 12), createdAt: new Date(), writeVersion: 0 };
    try {
      await transaction(db, async (session) => {
        const consumed = await db.collection(COLLECTIONS.invites).deleteOne({ _id: inviteId, expiresAt: { $gt: new Date() } }, { session });
        if (!consumed.deletedCount) throw new HttpError(400, "That invitation cannot be used. Ask the owner for a new one.");
        await db.collection(COLLECTIONS.users).insertOne(user, { session });
        await createSession(db, req, res, "user", user._id, session);
      });
    } catch (error) {
      if (error?.code === 11000) throw new HttpError(409, "That nickname cannot be used. Try another made-up nickname.");
      throw error;
    }
    respond(res, 201, { user: { nickname: user.nickname } });
  }, databaseProvider, state);
}

export default createAccountHandler();
