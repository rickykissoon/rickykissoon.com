/* eslint-disable no-undef */
import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI is not set");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(); // or client.db(process.env.MONGO_DB)
  const col = db.collection("expiring_object");

  await col.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0, name: "ttl_expireAt" });

  console.log("Indexes ensured.");
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await client.close();
}