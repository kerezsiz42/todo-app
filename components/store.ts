import { z } from "zod";
import { signal } from "@preact/signals";

const serializedItemSchema = z.object({
  _id: z.string(),
  text: z.string(),
  done: z.boolean(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

type SerializedItem = z.infer<typeof serializedItemSchema>;

export const items = signal<SerializedItem[]>([]);

const sortByCreatedAt = (arr: SerializedItem[]): SerializedItem[] =>
  arr.sort((a, b) => {
    const ad = new Date(a.createdAt).getTime();
    const bd = new Date(b.createdAt).getTime();
    return ad - bd;
  });

export const getAllItems = async () => {
  const res = await fetch("/api/items");
  const data = await res.json();
  const serializedItems = z.array(serializedItemSchema).safeParse(data);
  if (!serializedItems.success) {
    return;
  }
  const toBeAdded = serializedItems.data.filter(
    (serializedItem) =>
      !items.value.find((item) => item._id === serializedItem._id),
  );
  items.value = sortByCreatedAt([...toBeAdded, ...items.value]);
};

// deno-lint-ignore no-explicit-any
export const onMessage = (message: any) => {
  const result = z
    .discriminatedUnion("method", [
      z.object({ method: z.literal("POST"), item: serializedItemSchema }),
      z.object({
        method: z.literal("PATCH"),
        item: serializedItemSchema,
      }),
      z.object({
        method: z.literal("DELETE"),
        item: serializedItemSchema,
      }),
    ])
    .safeParse(message);
  if (!result.success) {
    return;
  }
  switch (result.data.method) {
    case "POST": {
      items.value = sortByCreatedAt([...items.value, result.data.item]);
      break;
    }
    case "PATCH": {
      items.value = sortByCreatedAt([
        ...items.value.filter((item) => item._id !== result.data.item._id),
        result.data.item,
      ]);
      break;
    }
    case "DELETE": {
      items.value = sortByCreatedAt(items.value.filter(
        (item) => item._id !== result.data.item._id,
      ));
      break;
    }
  }
};

export const patchItem = (item: SerializedItem) => {
  fetch("/api/items", {
    method: "PATCH",
    body: JSON.stringify({
      _id: item._id,
      field: "done",
      done: !item.done,
    }),
  });
};

export const deleteItem = (item: SerializedItem) => {
  fetch("/api/items", {
    method: "DELETE",
    body: JSON.stringify({
      _id: item._id,
    }),
  });
};
