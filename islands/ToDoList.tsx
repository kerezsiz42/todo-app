import { WebSocketSubscriber } from "../components/WebSocketSubscriber.ts";
import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import {
  deleteItem,
  getAllItems,
  items,
  onMessage,
  patchItem,
} from "../components/store.ts";

export default () => {
  const text = useSignal("");
  const connected = useSignal(false);

  useEffect(() => {
    const wss = new WebSocketSubscriber(
      `${location.protocol === "https:" ? "wss" : "ws"}://${
        location.host
      }/api/websocket`,
      (isConnected) => (connected.value = isConnected),
      onMessage
    );
    return () => {
      wss.close();
    };
  }, []);

  useEffect(() => {
    if (connected) {
      getAllItems();
    }
  }, [connected]);

  return (
    <div class="flex flex-col p-3 w-[500px] h-full">
      <form
        class="flex"
        onSubmit={(e) => {
          e.preventDefault();
          fetch("/api/items", {
            method: "POST",
            body: JSON.stringify({ text: text.value }),
          });
          text.value = "";
        }}
      >
        <input
          class="p-2 border border-black rounded focus:outline-none mr-1 flex-grow"
          type="text"
          name="text"
          value={text.value}
          onInput={({ target }) => {
            if (target instanceof HTMLInputElement) {
              text.value = target.value;
            }
          }}
        />
        <button
          class="p-2 border border-black rounded focus:outline-none"
          type="submit"
        >
          Add item
        </button>
      </form>
      <span class="text-center">
        {connected.value ? "Connected" : "Not connected"}
      </span>
      <ul class="flex-grow">
        {items.value.map((item) => (
          <li class="flex justify-between items-center p-1">
            {item.text}
            <div>
              <button
                class="p-1 border border-black rounded focus:outline-none mr-2"
                type="button"
                onClick={() => deleteItem(item)}
              >
                Delete
              </button>
              <button
                class="p-1 border border-black rounded focus:outline-none"
                type="button"
                onClick={() => patchItem(item)}
              >
                {item.done ? "Done" : "To do"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
