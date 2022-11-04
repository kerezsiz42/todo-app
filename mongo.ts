import { MongoClient, ObjectId } from "mongo";

const MONGO_DB = "todo";
const MONGO_HOSTNAME = "cluster0.cxec7gx.mongodb.net";
const MONGO_PORT = 27017;
const MONGO_PASSWORD = "1YHdlp4e5anqJs8O";
const MONGO_USER = "da5janJ52D";

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
