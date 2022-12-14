// deno-lint-ignore-file no-explicit-any
export class PubSub {
  private sockets: WebSocket[] = [];
  private channel: BroadcastChannel;
  private static _instance?: PubSub;

  protected constructor() {
    const channel = new BroadcastChannel("justdoit");
    channel.onmessage = (ev: MessageEvent) => {
      this.sendall(ev.data);
    };
    this.channel = channel;
  }

  public static get instance(): PubSub {
    return (PubSub._instance ??= new PubSub());
  }

  public add(socket: WebSocket): void {
    this.sockets = [...this.sockets, socket];
  }

  public remove(socket: WebSocket): void {
    this.sockets = this.sockets.filter((s: WebSocket): boolean => s !== socket);
  }

  private sendall(data: any) {
    for (const ws of this.sockets) {
      ws.send(JSON.stringify(data));
    }
  }

  public publish(data: any) {
    this.channel.postMessage(data);
    this.sendall(data);
  }
}
