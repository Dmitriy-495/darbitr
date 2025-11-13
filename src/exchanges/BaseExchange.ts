// src/exchanges/BaseExchange.ts
import { WebSocketManager } from "../utils/WebSocketManager";
import { Logger } from "../utils/Common";
import { LatencyQueue } from "../utils/LatencyQueue";

export abstract class BaseExchange {
  protected wsManager: WebSocketManager;
  protected isConnected = false;
  protected latencyQueue = new LatencyQueue(10); // 🎯 ОЧЕРЕДЬ НА 10 ЗНАЧЕНИЙ
  protected lastPingTime = 0;
  protected pingInterval: NodeJS.Timeout | null = null;
  private initialPingAttempts = 0;
  private readonly maxInitialAttempts = 5;

  constructor(
    protected name: string,
    protected wsUrl: string,
    protected pingIntervalMs: number = 30000, // ⏰ 30 СЕКУНД ПО УМОЛЧАНИЮ
    protected pingFormat: any
  ) {
    this.wsManager = new WebSocketManager(
      wsUrl,
      (data: any) => this.onMessage(data),
      () => this.onReady(),
      (error: any) => Logger.error(`${name}: ${error}`)
    );
  }

  async connect(): Promise<void> {
    Logger.info(`🔗 ${this.name}: подключение...`);
    await this.wsManager.connect();
  }

  disconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.wsManager.disconnect();
    this.isConnected = false;
    Logger.warning(`🔌 ${this.name}: отключено`);
  }

  protected onReady(): void {
    this.isConnected = true;
    Logger.success(`✅ ${this.name}: подключено`);

    // 🚀 ЗАПУСКАЕМ ПЕРВОНАЧАЛЬНЫЕ 5 PING-ПОПЫТОК
    this.startInitialPingSequence();

    // ⏰ ЗАПУСКАЕМ РЕГУЛЯРНЫЙ PING КАЖДЫЕ 30 СЕКУНД
    this.startRegularPingInterval();
  }

  // 🚀 ПЕРВОНАЧАЛЬНЫЕ 5 PING-ПОПЫТОК
  private startInitialPingSequence(): void {
    Logger.info(`🎯 ${this.name}: запуск 5 начальных ping-попыток...`);

    const sendInitialPing = () => {
      if (
        this.initialPingAttempts < this.maxInitialAttempts &&
        this.isConnected
      ) {
        this.sendPing();
        this.initialPingAttempts++;

        if (this.initialPingAttempts < this.maxInitialAttempts) {
          setTimeout(sendInitialPing, 2000); // ⏳ 2 СЕКУНДЫ МЕЖДУ ПЫТКАМИ
        } else {
          Logger.success(`✅ ${this.name}: начальные ping-попытки завершены`);
        }
      }
    };

    sendInitialPing();
  }

  // ⏰ РЕГУЛЯРНЫЙ PING КАЖДЫЕ 30 СЕКУНД
  private startRegularPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendPing();
      }
    }, this.pingIntervalMs);

    Logger.info(
      `⏰ ${this.name}: регулярный ping каждые ${
        this.pingIntervalMs / 1000
      } сек`
    );
  }

  protected sendPing(): void {
    if (!this.isConnected) return;

    this.lastPingTime = Date.now();
    const pingData = this.formatPingRequest();
    this.wsManager.send(pingData);

    Logger.info(`📤 ${this.name}: отправлен ping`);
  }

  private formatPingRequest(): any {
    if (typeof this.pingFormat.request === "string") {
      return this.pingFormat.request;
    }

    const request = { ...this.pingFormat.request };
    if (request.time === "timestamp")
      request.time = Math.floor(Date.now() / 1000);
    if (request.id === "timestamp") request.id = Date.now();

    return request;
  }

  protected handlePong(data: any): void {
    const pongTime = Date.now();
    const latency = pongTime - this.lastPingTime;

    // 📊 ДОБАВЛЯЕМ В ОЧЕРЕДЬ И ВЫЧИСЛЯЕМ СРЕДНЕЕ
    this.latencyQueue.addLatency(latency);
    const averageLatency = this.latencyQueue.getAverage();

    // 📝 СТАНДАРТИЗИРОВАННЫЙ ЛОГ
    Logger.info(
      `🏓 ${this.name}: ping ${new Date(this.lastPingTime).toISOString()} | ` +
        `pong ${new Date(pongTime).toISOString()} | ` +
        `latency ${latency.toFixed(1)}ms | ` +
        `avg ${averageLatency}ms (${this.latencyQueue.getCount()}/10)`
    );

    // 🎯 ВЫВОД СРЕДНЕЙ ЗАДЕРЖКИ КАЖДЫЕ 5 PING-ПОПЫТОК
    if (this.latencyQueue.getCount() % 5 === 0) {
      Logger.success(`📊 ${this.name}: средняя задержка ${averageLatency}ms`);
    }
  }

  // 📊 ПОЛУЧЕНИЕ СТАТИСТИКИ
  public getStats(): {
    averageLatency: number;
    lastLatency: number;
    pingCount: number;
  } {
    return {
      averageLatency: this.latencyQueue.getAverage(),
      lastLatency: this.latencyQueue.getLast(),
      pingCount: this.latencyQueue.getCount(),
    };
  }

  // АБСТРАКТНЫЕ МЕТОДЫ
  protected abstract onMessage(data: any): void;
  protected abstract isPongMessage(msg: any): boolean;
}
