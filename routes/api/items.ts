import { Handlers } from "$fresh/server.ts";
import { Item, Items } from "../../mongo.ts";
import { z } from "zod";
import { ObjectId } from "mongo";
import { store } from "../../websockets.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const json = await req.json();
    const result = z.object({
      text: z.string().min(1),
    }).safeParse(json);
    if (!result.success) {
      return new Response(null, { status: 400 });
    }
    const now = new Date();
    const item: Item = {
      _id: new ObjectId(),
      text: result.data.text,
      done: false,
      updatedAt: now,
      createdAt: now,
    };
    try {
      await Items.insertOne(item);
    } catch {
      return new Response(null, { status: 500 });
    }
    for (const ws of store.websockets) {
      ws.send(JSON.stringify({ item, method: "POST" }));
    }
    return new Response();
  },

  async GET(_req, _ctx) {
    const items = await Items.find({}).toArray();
    return new Response(JSON.stringify(items));
  },

  async PATCH(req, _ctx) {
    const json = await req.json();
    const result = z.discriminatedUnion("field", [
      z.object({ _id: z.string(), field: z.literal("text"), text: z.string() }),
      z.object({
        _id: z.string(),
        field: z.literal("done"),
        done: z.boolean(),
      }),
    ]).safeParse(json);
    if (!result.success) {
      return new Response(null, { status: 400 });
    }
    const _id = new ObjectId(result.data._id);
    let item: Item | undefined;
    if (result.data.field === "done") {
      item = await Items.findAndModify({ _id }, {
        update: { $set: { done: result.data.done, updatedAt: new Date() } },
        new: true,
      });
    } else {
      item = await Items.findAndModify({ _id }, {
        update: { $set: { text: result.data.text, updatedAt: new Date() } },
        new: true,
      });
    }
    if (!item) {
      return new Response(null, { status: 500 });
    }
    for (const ws of store.websockets) {
      ws.send(JSON.stringify({ item, method: "PATCH" }));
    }
    return new Response();
  },

  async DELETE(req, _ctx) {
    const json = await req.json();
    const result = z.object({ _id: z.string() })
      .safeParse(json);
    if (!result.success) {
      return new Response(null, { status: 400 });
    }
    const _id = new ObjectId(result.data._id);
    const item = await Items.findOne({ _id });
    if (!item) {
      return new Response();
    }
    const deletedCount = await Items.deleteOne({ _id });
    if (deletedCount < 1) {
      return new Response(null, { status: 500 });
    }
    for (const ws of store.websockets) {
      ws.send(JSON.stringify({ item, method: "DELETE" }));
    }
    return new Response();
  },
};
