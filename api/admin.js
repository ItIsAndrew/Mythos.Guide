import { getDatabase } from "./_lib/mongodb.js";
import {
  COLLECTIONS, SETTINGS_ID, apiHandler, createSession, endSession, hashToken,
  ownerSecret, postingEnabled, publicPost, rateIdentity, rateLimit,
  requireAdmin, respond, sameSecret, token,
} from "./_lib/accounts.js";
import { HttpError, schema, validateId } from "./_lib/validation.js";

function cursorFromRequest(req) {
  const url = new URL(req.url || "/api/admin", "http://localhost");
  try { decodeURIComponent(url.search.replace(/\+/g, " ")); } catch { throw new HttpError(400, "Reload owner controls to browse posts."); }
  const keys = [...url.searchParams.keys(), ...Object.keys(req.query || {})];
  if (keys.some((key) => key !== "cursor") || url.searchParams.getAll("cursor").length > 1) {
    throw new HttpError(400, "Reload owner controls to browse posts.");
  }
  const value = Object.hasOwn(req.query || {}, "cursor") ? req.query.cursor : url.searchParams.get("cursor");
  return value === null ? null : validateId(value);
}

export function createAdminHandler(databaseProvider = getDatabase, state) {
  return apiHandler(["GET", "POST", "DELETE"], async (req, res, db, body) => {
    const identity = rateIdentity(req);
    await rateLimit(db, "owner-ip", identity, 120, 60_000);
    if (req.method === "POST" && body.action === "login") {
      schema(body, ["action", "passcode"]);
      await rateLimit(db, "owner-login", identity, 20, 15 * 60_000);
      if (!sameSecret(body.passcode, ownerSecret())) throw new HttpError(401, "The owner passcode did not match.");
      await endSession(db, req, res, "admin");
      await createSession(db, req, res, "admin");
      respond(res, 200, { unlocked: true });
      return;
    }
    if (req.method === "POST" && body.action === "logout") {
      schema(body, ["action"]);
      await endSession(db, req, res, "admin");
      respond(res, 200, { unlocked: false });
      return;
    }
    await requireAdmin(db, req);
    if (req.method === "GET") {
      const cursor = cursorFromRequest(req);
      const collection = db.collection(COLLECTIONS.posts);
      let filter = {};
      if (cursor) {
        const previous = await collection.findOne({ _id: cursor }, { projection: { _id: 1, createdAt: 1 }, maxTimeMS: 3000 });
        if (!(previous?.createdAt instanceof Date)) throw new HttpError(400, "The last post changed. Reload owner controls to browse posts.");
        filter = { $or: [{ createdAt: { $lt: previous.createdAt } }, { createdAt: previous.createdAt, _id: { $lt: cursor } }] };
      }
      const records = await collection.find(filter, {
        projection: { _id: 1, nickname: 1, text: 1, createdAt: 1 }, maxTimeMS: 3000,
      }).sort({ createdAt: -1, _id: -1 }).limit(101).toArray();
      const page = records.slice(0, 100);
      respond(res, 200, { postingEnabled: await postingEnabled(db), posts: page.map((record) => publicPost(record, true)).filter(Boolean), nextCursor: records.length > 100 ? page.at(-1)._id : null });
      return;
    }
    await rateLimit(db, "owner-write", identity, 60, 60_000);
    if (req.method === "DELETE") {
      schema(body, ["id"]);
      const result = await db.collection(COLLECTIONS.posts).deleteOne({ _id: validateId(body.id) });
      if (!result.deletedCount) throw new HttpError(404, "That post was not found.");
      respond(res, 200, { deleted: true });
      return;
    }
    if (body.action === "invite") {
      schema(body, ["action"]);
      await rateLimit(db, "owner-invite", identity, 10, 60 * 60_000);
      const inviteCode = token();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60_000);
      await db.collection(COLLECTIONS.invites).insertOne({ _id: hashToken(inviteCode), expiresAt });
      respond(res, 201, { inviteCode, expiresAt: expiresAt.toISOString() });
      return;
    }
    if (body.action === "posting") {
      schema(body, ["action", "enabled"]);
      if (typeof body.enabled !== "boolean") throw new HttpError(400, "Choose whether posting is on or off.");
      // All post creations/edits update this same document in their transaction.
      // A concurrent switch change forces them to retry and check the new value.
      await db.collection(COLLECTIONS.settings).updateOne({ _id: SETTINGS_ID }, {
        $set: { postingEnabled: body.enabled }, $inc: { writeVersion: 1 },
      });
      respond(res, 200, { postingEnabled: body.enabled });
      return;
    }
    throw new HttpError(400, "Choose an owner control from this page.");
  }, databaseProvider, state);
}

export default createAdminHandler();
