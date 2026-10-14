import { getDatabase } from "./_lib/mongodb.js";
import {
  COLLECTIONS, accountGate, apiHandler, currentUser, newId, postCooldown, postingEnabled,
  postingGate, publicPost, rateIdentity, rateLimit, respond, transaction,
} from "./_lib/accounts.js";
import { HttpError, schema, validateId, validatePostText } from "./_lib/validation.js";

export function createPostsHandler(databaseProvider = getDatabase, state) {
  return apiHandler(["GET", "POST", "PATCH", "DELETE"], async (req, res, db, body) => {
    const user = await currentUser(db, req);
    const identity = rateIdentity(req);
    await rateLimit(db, "posts-ip", identity, 180, 60_000);
    const collection = db.collection(COLLECTIONS.posts);
    if (req.method === "GET") {
      await rateLimit(db, "posts-read", user._id, 120, 60_000);
      const records = await collection.find({ userId: user._id }, {
        projection: { _id: 1, text: 1, createdAt: 1 }, maxTimeMS: 3000,
      }).sort({ createdAt: -1 }).limit(100).toArray();
      respond(res, 200, { posts: records.map((record) => publicPost(record)).filter(Boolean), postingEnabled: await postingEnabled(db) });
      return;
    }
    schema(body, req.method === "POST" ? ["text"] : req.method === "PATCH" ? ["id", "text"] : ["id"]);
    const id = req.method === "POST" ? newId() : validateId(body.id);
    const text = req.method === "DELETE" ? null : validatePostText(body.text);
    await rateLimit(db, "posts-write", user._id, 30, 60_000);
    if (req.method === "DELETE") {
      const result = await collection.deleteOne({ _id: id, userId: user._id });
      if (!result.deletedCount) throw new HttpError(404, "That post was not found in your notebook.");
      respond(res, 200, { deleted: true });
      return;
    }
    await postCooldown(db, user._id);
    const createdAt = new Date();
    await transaction(db, async (session) => {
      await postingGate(db, session);
      await accountGate(db, session, user._id);
      if (req.method === "POST") {
        const count = await collection.countDocuments({ userId: user._id }, { session, limit: 100, maxTimeMS: 3000 });
        if (count >= 100) throw new HttpError(409, "Your notebook holds 100 posts. Delete an older post to add another.");
        await collection.insertOne({ _id: id, userId: user._id, nickname: user.nickname, text, createdAt }, { session });
      } else {
        const result = await collection.updateOne({ _id: id, userId: user._id }, { $set: { text, updatedAt: new Date() } }, { session });
        if (!result.matchedCount) throw new HttpError(404, "That post was not found in your notebook.");
      }
    });
    respond(res, req.method === "POST" ? 201 : 200, req.method === "POST"
      ? { post: { id, text, createdAt: createdAt.toISOString() } } : { updated: true });
  }, databaseProvider, state);
}

export default createPostsHandler();
