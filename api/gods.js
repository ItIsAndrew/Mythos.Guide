import { getDatabase } from "./_lib/mongodb.js";
import { normalizeSearch, sampleGods } from "./_lib/sample-gods.js";

const COLLECTION = "mythos_guide_sample_gods";
const SAMPLE_IDS = sampleGods.map(({ id }) => id);
const SEARCH_ERROR = "Enter one god's name using 1 to 80 characters.";
const BROWSE_ERROR = "Choose all, Greek, or Roman in the gods browser, or search for one god's name.";
const seedStateKey = Symbol.for("mythos-guide.sample-seed");
const seedState = globalThis[seedStateKey] ??= { promise: null };

async function ensureSampleArchive(collection, archiveState) {
  if (!archiveState.promise) {
    archiveState.promise = (async () => {
      await collection.createIndex({ id: 1 }, { unique: true, name: "sample_god_id" });
      await collection.bulkWrite(
        sampleGods.map((record) => ({
          updateOne: {
            filter: { id: record.id },
            update: { $setOnInsert: record },
            upsert: true,
          },
        })),
        { ordered: false },
      );
    })().catch(() => {
      archiveState.promise = null;
      throw new Error("The sample archive could not be prepared.");
    });
  }
  await archiveState.promise;
}

function readRequest(req) {
  const url = new URL(req.url || "/api/gods", "http://localhost");
  // URLSearchParams otherwise silently replaces broken percent encodings.
  decodeURIComponent(url.search.replace(/\+/g, " "));
  const keys = [...url.searchParams.keys(), ...Object.keys(req.query || {})];
  // Both the local server and Vercel reject bracket-style array/object inputs.
  if (keys.some((key) => /^(mode|tradition)\[/.test(key))) return { error: BROWSE_ERROR };
  if (keys.some((key) => /^q\[/.test(key))) return { error: SEARCH_ERROR };

  function parameter(name) {
    const values = url.searchParams.getAll(name);
    const fromRequest = req.query && Object.hasOwn(req.query, name);
    const value = fromRequest ? req.query[name] : values[0];
    return {
      present: Boolean(fromRequest || values.length),
      value,
      invalid: values.length > 1 || (value !== undefined && typeof value !== "string"),
    };
  }

  const mode = parameter("mode");
  const tradition = parameter("tradition");
  const q = parameter("q");
  if (mode.invalid || tradition.invalid) return { error: BROWSE_ERROR };

  if (mode.present) {
    if (mode.value !== "browse" || q.present || q.invalid) return { error: BROWSE_ERROR };
    if (tradition.present && !["all", "Greek", "Roman"].includes(tradition.value)) {
      return { error: BROWSE_ERROR };
    }
    return { mode: "browse", tradition: tradition.present ? tradition.value : "all" };
  }
  if (tradition.present) return { error: BROWSE_ERROR };

  if (q.invalid || typeof q.value !== "string" || q.value.length > 80) return { error: SEARCH_ERROR };
  const query = q.value.trim();
  if (!query || !normalizeSearch(query)) return { error: SEARCH_ERROR };
  return { mode: "search", query };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchRank(record, query) {
  if (normalizeSearch(record.name) === query) return 0;
  if (record.searchNames.includes(query)) return 1;
  if (record.searchNames.some((name) => name.startsWith(query))) return 2;
  return 3;
}

function publicRecord(record) {
  return {
    id: record.id,
    name: record.name,
    tradition: record.tradition,
    description: record.description,
    domain: record.domain,
    symbols: record.symbols,
    equivalent: record.equivalent,
  };
}

function respond(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}

// The provider is injectable for tests; normal requests always use the shared
// server-only MongoDB client from getDatabase.
export function createGodsHandler(databaseProvider = getDatabase, archiveState = { promise: null }) {
  return async function handler(req, res) {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      respond(res, 405, { error: "Please use the search box to look up a god." });
      return;
    }

    let request;
    try {
      request = readRequest(req);
    } catch {
      request = { error: SEARCH_ERROR };
    }

    if (request.error) {
      respond(res, 400, { error: request.error });
      return;
    }

    try {
      const database = await databaseProvider();
      const collection = database.collection(COLLECTION);
      await ensureSampleArchive(collection, archiveState);

      if (request.mode === "browse") {
        const filter = {
          sampleArchive: "mythos-guide-v1",
          id: { $in: SAMPLE_IDS },
        };
        if (request.tradition !== "all") filter.tradition = request.tradition;
        const records = await collection.find(filter, {
          projection: {
            _id: 0,
            id: 1,
            name: 1,
            tradition: 1,
            description: 1,
            domain: 1,
            symbols: 1,
            equivalent: 1,
          },
          maxTimeMS: 3_000,
        }).limit(sampleGods.length).toArray();
        records.sort((a, b) => (
          a.name.localeCompare(b.name, "en")
          || a.tradition.localeCompare(b.tradition, "en")
        ));
        respond(res, 200, {
          mode: "browse",
          total: records.length,
          results: records.map(publicRecord),
        });
        return;
      }

      const { query } = request;
      const normalized = normalizeSearch(query);
      const records = await collection.find({
        sampleArchive: "mythos-guide-v1",
        id: { $in: SAMPLE_IDS },
        searchNames: { $regex: escapeRegex(normalized) },
      }, {
        projection: {
          _id: 0,
          id: 1,
          name: 1,
          tradition: 1,
          description: 1,
          domain: 1,
          symbols: 1,
          equivalent: 1,
          searchNames: 1,
        },
        maxTimeMS: 3_000,
      }).limit(sampleGods.length).toArray();

      records.sort((a, b) => (
        matchRank(a, normalized) - matchRank(b, normalized)
        || a.name.localeCompare(b.name, "en")
        || a.tradition.localeCompare(b.tradition, "en")
      ));

      respond(res, 200, {
        query,
        results: records.slice(0, 8).map(publicRecord),
      });
    } catch {
      // Return only a fixed, friendly message. Raw database errors can reveal
      // connection details, so they must never be sent to the browser or logs.
      respond(res, 503, {
        error: "The mythology archive is taking a break. Please try your search again in a moment.",
      });
    }
  };
}

export default createGodsHandler(getDatabase, seedState);
