import { getDatabase } from "./_lib/mongodb.js";
import { normalizeSearch, sampleGods } from "./_lib/sample-gods.js";

const COLLECTION = "mythos_guide_sample_gods";
const seedStateKey = Symbol.for("mythos-guide.sample-seed");
const seedState = globalThis[seedStateKey] ??= { promise: null };

async function ensureSampleArchive(collection) {
  if (!seedState.promise) {
    seedState.promise = (async () => {
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
      seedState.promise = null;
      throw new Error("The sample archive could not be prepared.");
    });
  }
  await seedState.promise;
}

function readQuery(req) {
  const url = new URL(req.url || "/api/gods", "http://localhost");
  // URLSearchParams otherwise silently replaces broken percent encodings.
  decodeURIComponent(url.search.replace(/\+/g, " "));
  const urlQueries = url.searchParams.getAll("q");
  if (urlQueries.length > 1) return null;

  const queryValue = req.query && Object.hasOwn(req.query, "q")
    ? req.query.q
    : urlQueries[0];

  if (typeof queryValue !== "string" || queryValue.length > 80) return null;
  const query = queryValue.trim();
  if (!query || !normalizeSearch(query)) return null;
  return query;
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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    respond(res, 405, { error: "Please use the search box to look up a god." });
    return;
  }

  let query;
  try {
    query = readQuery(req);
  } catch {
    query = null;
  }

  if (query === null) {
    respond(res, 400, { error: "Enter one god's name using 1 to 80 characters." });
    return;
  }

  try {
    const database = await getDatabase();
    const collection = database.collection(COLLECTION);
    await ensureSampleArchive(collection);

    const normalized = normalizeSearch(query);
    const records = await collection.find({
      sampleArchive: "mythos-guide-v1",
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
    }).limit(100).toArray();

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
}
