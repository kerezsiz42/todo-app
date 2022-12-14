import { Handlers } from "$fresh/server.ts";
import { PubSub } from "../../PubSub.ts";

export const handler: Handlers = {
  GET(req, _ctx) {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const pubsub = PubSub.instance;
    socket.onopen = () => {
      pubsub.add(socket);
      setTimeout(() => {
        socket.close();
      }, 60_000);
    };
    socket.onclose = () => {
      pubsub.remove(socket);
    };
    return response;
  },
};
