import { MongoClient } from "mongodb";

const stateKey = Symbol.for("mythos-guide.mongodb");
const state = globalThis[stateKey] ??= { client: null, connection: null };

export class DatabaseUnavailableError extends Error {
  constructor(reason = "connection") {
    super("The mythology archive is temporarily unavailable.");
    this.name = "DatabaseUnavailableError";
    this.reason = reason;
  }
}

// Only this server module reads the connection setting. Never log driver errors:
// some driver messages contain parts of the private connection URL.
export async function getDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri === "PASTE_YOUR_DATABASE_LINK_HERE") {
    throw new DatabaseUnavailableError("configuration");
  }

  if (!state.client) {
    try {
      state.client = new MongoClient(uri, {
        appName: "Mythos.Guide",
        maxPoolSize: 5,
        minPoolSize: 0,
        maxIdleTimeMS: 60_000,
        serverSelectionTimeoutMS: 5_000,
        connectTimeoutMS: 5_000,
        socketTimeoutMS: 10_000,
        monitorCommands: false,
        mongodbLogComponentSeverities: { default: "off" },
      });
    } catch {
      throw new DatabaseUnavailableError("configuration");
    }
  }

  if (!state.connection) {
    // Reuse the client and its connection across requests. A failed attempt can
    // be retried by the next request without caching a rejected promise.
    state.connection = state.client.connect().catch(() => {
      state.connection = null;
      throw new DatabaseUnavailableError();
    });
  }

  await state.connection;
  return state.client.db();
}
