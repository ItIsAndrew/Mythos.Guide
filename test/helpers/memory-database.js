import { isDeepStrictEqual } from 'node:util';

const copy = (value) => structuredClone(value);

function matches(document, filter = {}) {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === '$and') return expected.every((item) => matches(document, item));
    if (key === '$or') return expected.some((item) => matches(document, item));
    const actual = document[key];
    if (expected && typeof expected === 'object' && !(expected instanceof Date) && !Array.isArray(expected)) {
      return Object.entries(expected).every(([operator, operand]) => {
        if (operator === '$gt') return actual > operand;
        if (operator === '$gte') return actual >= operand;
        if (operator === '$lt') return actual < operand;
        if (operator === '$lte') return actual <= operand;
        if (operator === '$ne') return !isDeepStrictEqual(actual, operand);
        if (operator === '$exists') return (actual !== undefined) === operand;
        if (operator === '$in') return operand.some((value) => isDeepStrictEqual(actual, value));
        if (operator === '$nin') return !operand.some((value) => isDeepStrictEqual(actual, value));
        throw new Error(`Unsupported fake database filter: ${operator}`);
      });
    }
    return isDeepStrictEqual(actual, expected);
  });
}

function projected(document, projection) {
  if (!document) return null;
  if (!projection) return copy(document);
  const included = Object.entries(projection).filter(([key, flag]) => key !== '_id' && flag);
  if (included.length) {
    const result = {};
    for (const [key] of included) if (Object.hasOwn(document, key)) result[key] = copy(document[key]);
    if (projection._id !== 0 && Object.hasOwn(document, '_id')) result._id = copy(document._id);
    return result;
  }
  const result = copy(document);
  for (const [key, flag] of Object.entries(projection)) if (!flag) delete result[key];
  return result;
}

function updateDocument(document, update, inserted = false) {
  for (const [operator, fields] of Object.entries(update)) {
    if (operator === '$setOnInsert') {
      if (inserted) Object.assign(document, copy(fields));
    } else if (operator === '$set') Object.assign(document, copy(fields));
    else if (operator === '$inc') {
      for (const [key, value] of Object.entries(fields)) document[key] = (document[key] || 0) + value;
    } else if (operator === '$unset') {
      for (const key of Object.keys(fields)) delete document[key];
    } else if (operator === '$max') {
      for (const [key, value] of Object.entries(fields)) {
        if (document[key] === undefined || document[key] < value) document[key] = copy(value);
      }
    } else throw new Error(`Unsupported fake database update: ${operator}`);
  }
}

// A shared in-memory database, with MongoDB-style atomic single-document writes,
// unique indexes, projections, and serialized transactions with rollback. It
// models transaction outcomes; the live integration test covers driver retries.
export function memoryDatabase() {
  const collections = new Map();
  const calls = [];
  let generatedId = 0;
  let transactionTail = Promise.resolve();
  let commitFailure = null;

  function collection(name) {
    if (collections.has(name)) return collections.get(name);
    const value = {
      name,
      documents: [],
      indexes: [{ keys: ['_id'], unique: true }],
      checkUnique(document, exclude) {
        for (const index of this.indexes.filter(({ unique }) => unique)) {
          if (this.documents.some((record) => record !== exclude && index.keys.every((key) => (
            isDeepStrictEqual(record[key], document[key])
          )))) {
            const error = new Error('PRIVATE_DUPLICATE_DETAILS');
            error.code = 11000;
            throw error;
          }
        }
      },
      beforeWrite(options) { options?.session?.record(this); },
      async createIndex(keys, options = {}) {
        calls.push({ name, operation: 'createIndex', keys: copy(keys), options: copy(options) });
        if (!this.indexes.some((index) => isDeepStrictEqual(index.keys, Object.keys(keys)))) {
          this.indexes.push({ keys: Object.keys(keys), unique: Boolean(options.unique) });
        }
        return options.name || Object.keys(keys).join('_');
      },
      async findOne(filter = {}, options = {}) {
        calls.push({ name, operation: 'findOne', filter: copy(filter) });
        return projected(this.documents.find((record) => matches(record, filter)), options.projection);
      },
      find(filter = {}, options = {}) {
        calls.push({ name, operation: 'find', filter: copy(filter) });
        let records = this.documents.filter((record) => matches(record, filter)).map(copy);
        const cursor = {
          sort(order) {
            records.sort((a, b) => {
              for (const [key, direction] of Object.entries(order)) {
                if (a[key] > b[key]) return direction;
                if (a[key] < b[key]) return -direction;
              }
              return 0;
            });
            return this;
          },
          limit(limit) { records = records.slice(0, limit); return this; },
          async toArray() { return records.map((record) => projected(record, options.projection)); },
        };
        return cursor;
      },
      async insertOne(document, options = {}) {
        this.beforeWrite(options);
        const record = copy(document);
        record._id ??= `fake-${++generatedId}`;
        this.checkUnique(record);
        this.documents.push(record);
        calls.push({ name, operation: 'insertOne', document: copy(record) });
        return { acknowledged: true, insertedId: record._id };
      },
      async updateOne(filter, update, options = {}) {
        this.beforeWrite(options);
        let record = this.documents.find((document) => matches(document, filter));
        calls.push({ name, operation: 'updateOne', filter: copy(filter), update: copy(update) });
        if (!record && !options.upsert) return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
        const inserted = !record;
        const next = record ? copy(record) : Object.fromEntries(Object.entries(filter).filter(([, item]) => (
          !item || typeof item !== 'object' || item instanceof Date
        )));
        next._id ??= `fake-${++generatedId}`;
        updateDocument(next, update, inserted);
        this.checkUnique(next, record);
        if (record) Object.assign(record, next);
        else { record = next; this.documents.push(record); }
        return {
          acknowledged: true, matchedCount: Number(!inserted), modifiedCount: Number(!inserted),
          upsertedCount: Number(inserted), upsertedId: inserted ? record._id : null,
        };
      },
      async findOneAndUpdate(filter, update, options = {}) {
        this.beforeWrite(options);
        const record = this.documents.find((document) => matches(document, filter));
        const before = record ? copy(record) : null;
        calls.push({ name, operation: 'findOneAndUpdate', filter: copy(filter), update: copy(update) });
        if (!record && !options.upsert) return null;
        const next = record ? copy(record) : Object.fromEntries(Object.entries(filter).filter(([, item]) => (
          !item || typeof item !== 'object' || item instanceof Date
        )));
        next._id ??= `fake-${++generatedId}`;
        updateDocument(next, update, !record);
        this.checkUnique(next, record);
        if (record) Object.assign(record, next);
        else this.documents.push(next);
        return projected(options.returnDocument === 'after' ? next : before, options.projection);
      },
      async deleteOne(filter, options = {}) {
        this.beforeWrite(options);
        const index = this.documents.findIndex((record) => matches(record, filter));
        if (index < 0) return { acknowledged: true, deletedCount: 0 };
        this.documents.splice(index, 1);
        calls.push({ name, operation: 'deleteOne', filter: copy(filter) });
        return { acknowledged: true, deletedCount: 1 };
      },
      async deleteMany(filter = {}, options = {}) {
        this.beforeWrite(options);
        const before = this.documents.length;
        this.documents = this.documents.filter((record) => !matches(record, filter));
        calls.push({ name, operation: 'deleteMany', filter: copy(filter) });
        return { acknowledged: true, deletedCount: before - this.documents.length };
      },
      async countDocuments(filter = {}) {
        return this.documents.filter((record) => matches(record, filter)).length;
      },
    };
    collections.set(name, value);
    return value;
  }

  const client = {
    startSession() {
      const snapshots = new Map();
      return {
        record(value) { if (!snapshots.has(value)) snapshots.set(value, copy(value.documents)); },
        async withTransaction(callback) {
          let release;
          const previous = transactionTail;
          transactionTail = new Promise((resolve) => { release = resolve; });
          await previous;
          try {
            const result = await callback();
            if (commitFailure) {
              const error = commitFailure;
              commitFailure = null;
              throw error;
            }
            return result;
          }
          catch (error) {
            for (const [value, documents] of snapshots) value.documents = documents;
            throw error;
          } finally { snapshots.clear(); release(); }
        },
        async endSession() {},
      };
    },
  };
  return {
    collection, client, collections, calls,
    failNextCommit(error) { commitFailure = error; },
  };
}
