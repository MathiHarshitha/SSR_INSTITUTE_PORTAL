import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

// A single-node replica set, not a plain standalone instance — several services (e.g.
// auth.service's registerStudent/registerTrainer) use mongoose sessions/transactions, which
// MongoDB only supports on a replica set.
let replset: MongoMemoryReplSet;

beforeAll(async () => {
  replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replset.getUri());
}, 120000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await replset?.stop();
});
