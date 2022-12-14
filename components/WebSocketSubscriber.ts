export class WebSocketSubscriber {
  private timeoutId?: number;
  private ws: WebSocket;
  private isConnected: boolean;
  private previousIsConnected: boolean;
  private maxRetryDelay: number;
  private startRetryDelay: number;
  private currentRetryDelay: number;
  private onStateChange: (isConnected: boolean) => void;
  private onMessage: (message: string) => void;

  constructor(
    url: string | URL,
    onStateChange: (isConnected: boolean) => void,
    // deno-lint-ignore no-explicit-any
    onMessage: (message: any) => void
  ) {
    this.ws = this.connect(url);
    this.isConnected = false;
    this.previousIsConnected = false;
    this.maxRetryDelay = 16384;
    this.startRetryDelay = 128;
    this.currentRetryDelay = this.startRetryDelay;
    this.onStateChange = onStateChange;
    this.onMessage = onMessage;
  }

  private setState(newState: boolean): void {
    this.previousIsConnected = this.isConnected;
    this.isConnected = newState;
    this.onStateChange(this.isConnected);
  }

  private connect(url: string | URL) {
    clearTimeout(this.timeoutId);
    const ws = new WebSocket(url);
    ws.onopen = () => {
      this.setState(true);
      this.currentRetryDelay = this.startRetryDelay;
    };
    ws.onmessage = (e) => {
      this.onMessage(JSON.parse(e.data));
    };
    ws.onclose = () => {
      this.setState(false);
      if (this.previousIsConnected === false && this.isConnected === false) {
        this.currentRetryDelay *= 2;
      }
      this.timeoutId = setTimeout(
        () => this.connect(url),
        Math.min(this.maxRetryDelay, this.currentRetryDelay)
      );
    };
    this.ws = ws;
    return ws;
  }

  close() {
    clearTimeout(this.timeoutId);
    this.ws.close();
  }
}
