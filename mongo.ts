import { MongoClient, ObjectId } from "mongo";
import { z } from "zod";

console.log(`Process started with pid: ${Deno.pid}`);
try {
  new TextDecoder("utf-8")
    .decode(
      Deno.readFileSync(".env"),
    )
    .split("\n")
    .filter((envvar) => /^(?!#)/.test(envvar) && envvar !== "")
    .map((envvar) => envvar.trim().split("="))
    .forEach(([key, value]) => {
      Deno.env.set(key, value);
    });
} catch {
  // Continue if no .env file found
}

export const {
  MONGO_DB,
  MONGO_HOSTNAME,
  MONGO_PASSWORD,
  MONGO_PORT,
  MONGO_USER,
} = z.object({
  MONGO_DB: z.string(),
  MONGO_HOSTNAME: z.string(),
  MONGO_PASSWORD: z.string(),
  MONGO_PORT: z
    .string()
    .regex(/\d+/)
    .transform(Number),
  MONGO_USER: z.string(),
}).parse(Deno.env.toObject());

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
