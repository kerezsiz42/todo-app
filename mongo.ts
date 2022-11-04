import { MongoClient, ObjectId } from "mongo";
import { config } from "dotenv";

const { MONGO_DB, MONGO_HOSTNAME, MONGO_PORT, MONGO_PASSWORD, MONGO_USER } =
  await config();

export const mongo = new MongoClient();
console.log("Connecting to database...");
await mongo.connect(
  `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authMechanism=SCRAM-SHA-1`,
);

const db = mongo.database(MONGO_DB);

export type Item = {
  _id: ObjectId;
  text: string;
  done: boolean;
  updatedAt: Date;
  createdAt: Date;
};

export type DeserializedItem = {
  _id: string;
  text: string;
  done: boolean;
  updatedAt: Date;
  createdAt: Date;
};

export const Items = db.collection<Item>("items");
