// src/utils/WebSocketManager.ts
import WebSocket from "ws";

export class WebSocketManager {
  private ws: WebSocket | null = null;

  constructor(
    private url: string,
    private onMessage: (data: any) => void,
    private onConnected: () => void,
    private onError: (error: any) => void
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.on("open", () => {
          this.onConnected();
          resolve();
        });

        this.ws.on("message", (data: Buffer) => {
          const messageString = data.toString();

          if (
            messageString.trim().startsWith("{") ||
            messageString.trim().startsWith("[")
          ) {
            try {
              const parsed = JSON.parse(messageString);
              this.onMessage(parsed);
            } catch {
              this.onMessage(messageString);
            }
          } else {
            this.onMessage(messageString);
          }
        });

        this.ws.on("close", () => {});

        this.ws.on("error", (error) => {
          this.onError(error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  send(data: any): void {
    if (this.ws) {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      this.ws.send(message);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
