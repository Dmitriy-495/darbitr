// src/exchanges/BaseExchange.ts
import { WebSocketManager } from "../utils/WebSocketManager";
import { LatencyQueue } from "../utils/LatencyQueue";
import { Subscription } from "../config";
import { MessageUtils } from "../utils/MessageUtils";

export class BaseExchange {
  protected wsManager: WebSocketManager;
  protected isConnected = false;
  protected latencyQueue = new LatencyQueue(10);
  protected lastPingTime = 0;
  protected pingInterval: NodeJS.Timeout | null = null;
  protected pongTimeout: NodeJS.Timeout | null = null;
  protected subscriptions: Subscription[] = [];

  constructor(
    protected name: string,
    protected wsUrl: string,
    protected connectionConfig: any
  ) {
    this.subscriptions = connectionConfig.subscriptions || [];

    this.wsManager = new WebSocketManager(
      wsUrl,
      (data: any) => this.handleMessage(data),
      () => this.onReady(),
      (error: any) => {} // Тихая обработка ошибок
    );
  }

  // 🎯 ЧИСТЫЙ ОБРАБОТЧИК СООБЩЕНИЙ
  protected handleMessage(data: any): void {
    for (const subscription of this.subscriptions) {
      if (MessageUtils.matchesPattern(data, subscription.match)) {
        this.executeAction(subscription.action, data);
        return;
      }
    }
  }

  private executeAction(action: string, data: any): void {
    if (action === "handlePong") {
      this.handlePong(data);
    }
  }

  async connect(): Promise<void> {
    await this.wsManager.connect();
  }

  disconnect(): void {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.pongTimeout) clearTimeout(this.pongTimeout);
    this.wsManager.disconnect();
    this.isConnected = false;
  }

  protected onReady(): void {
    this.isConnected = true;
    this.startPingInterval();
  }

  private startPingInterval(): void {
    if (this.pingInterval) clearInterval(this.pingInterval);

    const pingIntervalMs = this.connectionConfig.pingIntervalMs || 30000;
    this.pingInterval = setInterval(() => {
      if (this.isConnected) this.sendPing();
    }, pingIntervalMs);

    this.sendPing();
  }

  protected sendPing(): void {
    if (!this.isConnected) return;

    this.lastPingTime = Date.now();
    const pingFormat = this.connectionConfig.pingFormat;
    const pingData = MessageUtils.formatPingRequest(pingFormat);

    const timestamp = new Date().toISOString().substring(11, 19);
    console.log(`${timestamp} ${this.name} ping отправлен`);

    if (this.pongTimeout) clearTimeout(this.pongTimeout);
    this.pongTimeout = setTimeout(() => {
      const waitTime = Date.now() - this.lastPingTime;
      console.log(`${timestamp} ${this.name} нет ответа PONG ${waitTime}ms`);
    }, 5000);

    this.wsManager.send(pingData);
  }

  protected handlePong(data: any): void {
    if (this.pongTimeout) clearTimeout(this.pongTimeout);

    const pongTime = Date.now();
    const latency = pongTime - this.lastPingTime;

    this.latencyQueue.addLatency(latency);

    const timestamp = new Date().toISOString().substring(11, 19);
    console.log(`${timestamp} ${this.name} pong получен, отклик ${latency}ms`);
  }

  public getStats() {
    return {
      averageLatency: this.latencyQueue.getAverage(),
      lastLatency: this.latencyQueue.getLast(),
      pingCount: this.latencyQueue.getCount(),
    };
  }
}
