import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db: Db;

declare global {
    let __db: Db | undefined;
}

const MONGO_URI = process.env.MONGO_URI;

export async function getDb(): Promise<Db> {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }

    if (!db) {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db();
    }

    return db;
}