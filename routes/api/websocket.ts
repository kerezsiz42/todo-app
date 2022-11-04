import { Handlers } from "$fresh/server.ts";
import { store } from "../../websockets.ts";

export const handler: Handlers = {
  GET(req, _ctx) {
    const { socket, response } = Deno.upgradeWebSocket(req);
    socket.onopen = () => {
      store.websockets = [...store.websockets, socket];
      setTimeout(() => {
        socket.close();
      }, 60_000);
    };
    socket.onclose = () => {
      store.websockets = store.websockets.filter((s) => s !== socket);
    };
    return response;
  },
};
