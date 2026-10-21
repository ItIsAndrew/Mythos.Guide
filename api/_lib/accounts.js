import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getDatabase } from "./mongodb.js";
import { HttpError, safePostText, validateNickname } from "./validation.js";

export const COLLECTIONS = Object.freeze({
  users: "mythos_guide_users",
  sessions: "mythos_guide_sessions",
  posts: "mythos_guide_posts",
  settings: "mythos_guide_settings",
  limits: "mythos_guide_rate_limits",
});
export const SETTINGS_ID = "posting";
export const USER_COOKIE = "mythos_session";
export const ADMIN_COOKIE = "mythos_owner";
const BODY_LIMIT = 4096;
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const ADMIN_SESSION_MS = 60 * 60 * 1000;
const defaultState = globalThis[Symbol.for("mythos-guide.accounts-indexes")] ??= { promise: null };

export const token = () => randomBytes(32).toString("base64url");
export const newId = () => randomBytes(16).toString("hex");
export const hashToken = (value) => createHash("sha256").update(value).digest("hex");

export function ownerSecret() {
  const secret = process.env.ADMIN_PASSCODE;
  if (typeof secret !== "string" || secret.length < 16 || Buffer.byteLength(secret, "utf8") > 200) {
    throw new HttpError(503, "Account controls are temporarily unavailable.");
  }
  return secret;
}

export function sameSecret(left, right) {
  return typeof left === "string" && Buffer.byteLength(left, "utf8") <= 200
    && timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest());
}

function header(req, key) {
  const value = req.headers?.[key];
  return typeof value === "string" ? value : "";
}

export function checkOrigin(req) {
  const host = header(req, "host");
  const origin = header(req, "origin");
  if (!host || !origin || host.length > 255 || /[\s/@\\?#]/.test(host)) {
    throw new HttpError(403, "Open this page directly to make changes.");
  }
  let expected;
  try {
    const candidate = new URL(`https://${host}`);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(candidate.hostname);
    const secure = process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
      || req.socket?.encrypted || header(req, "x-forwarded-proto") === "https";
    expected = `${secure || !loopback ? "https" : "http"}://${candidate.host}`;
  } catch {
    throw new HttpError(403, "Open this page directly to make changes.");
  }
  if (origin !== expected) throw new HttpError(403, "Open this page directly to make changes.");
}

export async function readJson(req) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(header(req, "content-type"))) {
    throw new HttpError(415, "Please send changes using the page controls.");
  }
  const declared = header(req, "content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > BODY_LIMIT)) {
    throw new HttpError(413, "This request is too long.");
  }
  let raw;
  if (req.body !== undefined) {
    if (Buffer.isBuffer(req.body)) raw = req.body.toString("utf8");
    else if (typeof req.body === "string") raw = req.body;
    else {
      try { raw = JSON.stringify(req.body); } catch { throw new HttpError(400, "This request is not valid."); }
    }
  } else {
    const chunks = [];
    let length = 0;
    for await (const chunk of req) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      length += bytes.length;
      if (length > BODY_LIMIT) throw new HttpError(413, "This request is too long.");
      chunks.push(bytes);
    }
    raw = Buffer.concat(chunks).toString("utf8");
  }
  if (typeof raw !== "string" || Buffer.byteLength(raw, "utf8") > BODY_LIMIT) {
    throw new HttpError(413, "This request is too long.");
  }
  try {
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw new HttpError(400, "This request is not valid.");
  }
}

export function respond(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}

export function apiHandler(methods, action, databaseProvider = getDatabase, state = defaultState) {
  return async (req, res) => {
    try {
      if (!methods.includes(req.method)) {
        res.setHeader("Allow", methods.join(", "));
        throw new HttpError(405, "Please use the page controls for this action.");
      }
      if (req.method !== "GET") checkOrigin(req);
      const body = req.method === "GET" ? null : await readJson(req);
      const database = await databaseProvider();
      await ensureIndexes(database, state);
      await action(req, res, database, body);
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.retryAfter) res.setHeader("Retry-After", String(error.retryAfter));
        respond(res, error.status, { error: error.message });
      } else {
        // Driver errors can include private connection details. Never expose or log them.
        respond(res, 503, { error: "The notebook is taking a break. Please try again in a moment." });
      }
    }
  };
}

export async function ensureIndexes(db, state = defaultState) {
  if (!state.promise) {
    state.promise = (async () => {
      await Promise.all([
        db.collection(COLLECTIONS.users).createIndex({ nicknameKey: 1 }, { unique: true, name: "unique_nickname" }),
        db.collection(COLLECTIONS.sessions).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "session_expiry" }),
        db.collection(COLLECTIONS.sessions).createIndex({ userId: 1 }, { name: "user_sessions" }),
        db.collection(COLLECTIONS.posts).createIndex({ userId: 1, createdAt: -1 }, { name: "private_posts" }),
        db.collection(COLLECTIONS.posts).createIndex({ createdAt: -1, _id: -1 }, { name: "owner_posts_cursor" }),
        db.collection(COLLECTIONS.limits).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "rate_limit_expiry" }),
      ]);
      await db.collection(COLLECTIONS.settings).updateOne({ _id: SETTINGS_ID }, {
        $setOnInsert: { postingEnabled: true, writeVersion: 0 },
      }, { upsert: true });
    })().catch(() => {
      state.promise = null;
      throw new HttpError(503, "The notebook is taking a break. Please try again in a moment.");
    });
  }
  await state.promise;
}

export async function postingEnabled(db) {
  const record = await db.collection(COLLECTIONS.settings).findOne({ _id: SETTINGS_ID }, { maxTimeMS: 3000 });
  return record?.postingEnabled === true;
}

export function rateIdentity(req) {
  // Vercel reserves and overwrites this header. Locally, use the actual socket.
  const address = process.env.VERCEL === "1" ? header(req, "x-vercel-forwarded-for") : req.socket?.remoteAddress;
  return createHmac("sha256", ownerSecret()).update(String(address || "unknown").slice(0, 256)).digest("hex");
}

export async function rateLimit(db, scope, identity, limit, windowMs) {
  const now = Date.now();
  const start = Math.floor(now / windowMs) * windowMs;
  const id = createHmac("sha256", ownerSecret()).update(`${scope}:${identity}:${start}`).digest("hex");
  const collection = db.collection(COLLECTIONS.limits);
  try {
    await collection.updateOne({ _id: id }, { $setOnInsert: {
      count: 0, expiresAt: new Date(start + windowMs + 60_000),
    } }, { upsert: true });
  } catch (error) {
    if (error?.code !== 11000) throw error;
  }
  const record = await collection.findOneAndUpdate({ _id: id, count: { $lt: limit } }, {
    $inc: { count: 1 },
  }, { returnDocument: "after", includeResultMetadata: false, maxTimeMS: 3000 });
  if (!record) throw new HttpError(429, "Please slow down and try again later.", Math.max(1, Math.ceil((start + windowMs - now) / 1000)));
}

export async function postCooldown(db, userId) {
  const now = new Date();
  const id = createHmac("sha256", ownerSecret()).update(`post-cooldown:${userId}`).digest("hex");
  const collection = db.collection(COLLECTIONS.limits);
  try {
    await collection.updateOne({ _id: id }, { $setOnInsert: { nextAllowedAt: new Date(0), expiresAt: new Date(now.getTime() + 60_000) } }, { upsert: true });
  } catch (error) { if (error?.code !== 11000) throw error; }
  const record = await collection.findOneAndUpdate({ _id: id, nextAllowedAt: { $lte: now } }, {
    $set: { nextAllowedAt: new Date(now.getTime() + 3000), expiresAt: new Date(now.getTime() + 60_000) },
  }, { returnDocument: "after", includeResultMetadata: false, maxTimeMS: 3000 });
  if (!record) throw new HttpError(429, "Wait a few seconds before changing another post.", 3);
}

function cookieToken(req, name) {
  const cookies = header(req, "cookie");
  if (cookies.length > 4096) return null;
  const matches = cookies.split(";").map((part) => part.trim()).filter((part) => part.startsWith(`${name}=`));
  if (matches.length !== 1) return null;
  const value = matches[0].slice(name.length + 1);
  return /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
}

function secureCookie(req) {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production" || req.socket?.encrypted
    || header(req, "origin").startsWith("https://") || header(req, "x-forwarded-proto") === "https";
}

function setCookie(req, res, name, value, maxAge) {
  res.setHeader("Set-Cookie", `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureCookie(req) ? "; Secure" : ""}`);
}

export async function createSession(db, req, res, kind, userId, session, deferCookie = false) {
  const raw = token();
  const duration = kind === "admin" ? ADMIN_SESSION_MS : SESSION_MS;
  const record = { _id: hashToken(raw), kind, expiresAt: new Date(Date.now() + duration) };
  if (kind === "user") record.userId = userId;
  else record.secretVersion = hashToken(ownerSecret());
  await db.collection(COLLECTIONS.sessions).insertOne(record, session ? { session } : {});
  const commitCookie = () => setCookie(req, res, kind === "admin" ? ADMIN_COOKIE : USER_COOKIE, raw, duration / 1000);
  // A failed/retried transaction must not replace a working browser cookie.
  if (deferCookie) return commitCookie;
  commitCookie();
}

export async function endSession(db, req, res, kind) {
  const name = kind === "admin" ? ADMIN_COOKIE : USER_COOKIE;
  const raw = cookieToken(req, name);
  if (raw) await db.collection(COLLECTIONS.sessions).deleteOne({ _id: hashToken(raw), kind });
  setCookie(req, res, name, "", 0);
}

export function clearUserCookie(req, res) { setCookie(req, res, USER_COOKIE, "", 0); }

export async function currentUser(db, req, required = true) {
  const raw = cookieToken(req, USER_COOKIE);
  const session = raw && await db.collection(COLLECTIONS.sessions).findOne({
    _id: hashToken(raw), kind: "user", expiresAt: { $gt: new Date() },
  }, { maxTimeMS: 3000 });
  const user = session && await db.collection(COLLECTIONS.users).findOne({ _id: session.userId }, { maxTimeMS: 3000 });
  if (user) {
    try { validateNickname(user.nickname); } catch { throw new HttpError(401, "Please log in again."); }
    return user;
  }
  if (required) throw new HttpError(401, "Log in to open your private notebook.");
  return null;
}

export async function requireAdmin(db, req) {
  const raw = cookieToken(req, ADMIN_COOKIE);
  const session = raw && await db.collection(COLLECTIONS.sessions).findOne({
    _id: hashToken(raw), kind: "admin", expiresAt: { $gt: new Date() }, secretVersion: hashToken(ownerSecret()),
  }, { maxTimeMS: 3000 });
  if (!session) throw new HttpError(401, "Unlock owner controls to continue.");
}

export async function transaction(db, callback) {
  const session = db.client.startSession();
  try {
    return await session.withTransaction(() => callback(session), {
      readConcern: { level: "snapshot" }, writeConcern: { w: "majority" },
      readPreference: "primary", maxCommitTimeMS: 3000,
    });
  } finally { await session.endSession(); }
}

export async function postingGate(db, session) {
  const gate = await db.collection(COLLECTIONS.settings).findOneAndUpdate({
    _id: SETTINGS_ID, postingEnabled: true,
  }, { $inc: { writeVersion: 1 } }, {
    session, returnDocument: "after", includeResultMetadata: false, maxTimeMS: 3000,
  });
  if (!gate) throw new HttpError(403, "The owner has turned posting off. You can still read or delete your saved posts.");
}

export async function accountGate(db, session, userId) {
  const user = await db.collection(COLLECTIONS.users).findOneAndUpdate({ _id: userId }, {
    $inc: { writeVersion: 1 },
  }, { session, returnDocument: "after", includeResultMetadata: false, maxTimeMS: 3000 });
  if (!user) throw new HttpError(401, "Please log in again.");
}

export function publicPost(record, owner = false) {
  const text = safePostText(record.text);
  if (typeof record._id !== "string" || !/^[a-f0-9]{32}$/.test(record._id)) return null;
  const createdAt = record.createdAt instanceof Date && !Number.isNaN(record.createdAt.getTime())
    ? record.createdAt.toISOString() : "";
  const output = { id: record._id, text: text || "Hidden: this post contains blocked personal or contact information.", createdAt };
  if (owner) {
    try { output.nickname = validateNickname(record.nickname); } catch { output.nickname = "Unknown-alias"; }
  }
  return output;
}
