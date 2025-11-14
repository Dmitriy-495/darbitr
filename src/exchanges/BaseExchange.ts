// src/exchanges/BaseExchange.ts - ПРАВИЛЬНЫЕ ЦВЕТА И МОНЕТА!

/**
 * ⚡ БАЗОВЫЙ КЛАСС БИРЖИ - ПРАВИЛЬНЫЕ ЦВЕТА И BTC/USDT!
 * ДЕВИЗ: "СЕРЫЙ PONG! ОРАНЖЕВЫЙ DELTA! BTC/USDT!"
 */

import WebSocket from "ws";

export class BaseExchange {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private lastPingTime: number = 0;
  private lastBid: number = 0;
  private lastAsk: number = 0;

  // ⚡ ПУТИ В ПАМЯТИ!
  private bidPath: string[] = [];
  private askPath: string[] = [];

  // 🎨 ЦВЕТА ДЛЯ ЛОГОВ
  private readonly colors = {
    white: "\x1b[37m", // БЕЛЫЙ (основной текст)
    gray: "\x1b[90m", // СЕРЫЙ (ping/pong)
    delta: "\x1b[33m", // ОРАНЖЕВЫЙ (delta)
    bid: "\x1b[32m", // ЗЕЛЕНЫЙ
    ask: "\x1b[91m", // СВЕТЛО-КРАСНЫЙ
    reset: "\x1b[0m", // СБРОС
  };

  constructor(private config: any) {
    console.log(`🎯 ${config.name} - ГОТОВ`);

    if (this.config.bidAskPaths) {
      this.bidPath = this.config.bidAskPaths.bid.split(".");
      this.askPath = this.config.bidAskPaths.ask.split(".");
    }
  }

  async connect(): Promise<void> {
    console.log(`🔌 ${this.config.name} - ПОДКЛЮЧЕНИЕ...`);

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.config.wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log(`✅ ${this.config.name} - ПОДКЛЮЧЕНА`);
        this.startEngine();
        resolve();
      };

      this.ws.onmessage = (event) => {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        this.processData(data);
      };

      this.ws.onerror = reject;
      this.ws.onclose = () => (this.isConnected = false);

      setTimeout(
        () => !this.isConnected && reject(new Error("ТАЙМАУТ")),
        10000
      );
    });
  }

  private startEngine(): void {
    // ПОДПИСКИ
    if (this.config.subscribeMessages) {
      this.config.subscribeMessages.forEach((msg: any) => {
        this.ws!.send(JSON.stringify(this.processTimestamp(msg)));
      });
    }

    // PING-PONG КАЖДЫЕ 5 СЕКУНД!
    this.sendPing();
    setInterval(() => this.isConnected && this.sendPing(), 5000);
  }

  private processData(data: any): void {
    // PONG - ПРАВИЛЬНЫЕ ЦВЕТА И BTC/USDT!
    if (this.isPong(data)) {
      const pongTime = Date.now();
      const pingTime = this.lastPingTime;
      this.lastPingTime = 0;

      // 🎨 ПРАВИЛЬНЫЕ ЦВЕТА И BTC/USDT!
      const pingTimeStr = this.formatTime(pingTime);
      const pongTimeStr = this.formatTime(pongTime);
      const delta = pongTime - pingTime;

      console.log(
        `${this.colors.white}${this.config.name} | ` +
          `${this.colors.gray}PING: ${pingTimeStr} | ` +
          `${this.colors.gray}PONG: ${pongTimeStr} | ` +
          `${this.colors.delta}DELTA: ${delta}ms | ` +
          `${this.colors.bid}BTC/USDT BID: ${this.formatPrice(
            this.lastBid
          )} | ` +
          `${this.colors.ask}BTC/USDT ASK: ${this.formatPrice(this.lastAsk)}` +
          `${this.colors.reset}`
      );
      return;
    }

    // BEST BID/ASK - БЕЗ ЛОГОВ, ДАННЫЕ В ПАМЯТИ!
    const prices = this.extractPrices(data);
    if (prices) {
      this.lastBid = prices.bid;
      this.lastAsk = prices.ask;
    }
  }

  /**
   * 🕒 ФОРМАТИРОВАНИЕ ВРЕМЕНИ ДЛЯ ЧЕЛОВЕКА
   */
  private formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  /**
   * 💰 ФОРМАТИРОВАНИЕ ЦЕНЫ С РАЗДЕЛИТЕЛЯМИ
   */
  private formatPrice(price: number): string {
    if (price === 0) return "0.00";

    // ДВА ЗНАКА ПОСЛЕ ЗАПЯТОЙ И РАЗДЕЛИТЕЛИ ТЫСЯЧ
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  private extractPrices(data: any): { bid: number; ask: number } | null {
    let bid: number = 0;
    let ask: number = 0;

    if (this.bidPath.length > 0 && this.askPath.length > 0) {
      bid = this.getValueByPath(data, this.bidPath);
      ask = this.getValueByPath(data, this.askPath);
    } else {
      bid = this.autoDetectBid(data);
      ask = this.autoDetectAsk(data);
    }

    if (bid > 0 && ask > 0 && ask > bid) {
      return { bid, ask };
    }
    return null;
  }

  private getValueByPath(obj: any, path: string[]): number {
    let value = obj;
    for (const key of path) {
      if (value && typeof value === "object") {
        value = value[key];
      } else {
        return 0;
      }
    }
    return Number(value) || 0;
  }

  private autoDetectBid(data: any): number {
    if (data.data?.b?.[0]?.[0]) return Number(data.data.b[0][0]);
    if (data.data?.bids?.[0]?.[0]) return Number(data.data.bids[0][0]);
    if (data.data?.[0]?.bids?.[0]?.[0]) return Number(data.data[0].bids[0][0]);
    if (data.result?.[0]?.bids?.[0]?.[0])
      return Number(data.result[0].bids[0][0]);
    return 0;
  }

  private autoDetectAsk(data: any): number {
    if (data.data?.a?.[0]?.[0]) return Number(data.data.a[0][0]);
    if (data.data?.asks?.[0]?.[0]) return Number(data.data.asks[0][0]);
    if (data.data?.[0]?.asks?.[0]?.[0]) return Number(data.data[0].asks[0][0]);
    if (data.result?.[0]?.asks?.[0]?.[0])
      return Number(data.result[0].asks[0][0]);
    return 0;
  }

  private sendPing(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const ping = this.processTimestamp(
      this.config.connection.pingFormat.request
    );
    this.ws.send(typeof ping === "string" ? ping : JSON.stringify(ping));

    this.lastPingTime = Date.now();

    setTimeout(() => {
      if (this.lastPingTime > 0) {
        console.log(`⏰ ${this.config.name} - ТАЙМАУТ PONG`);
        this.lastPingTime = 0;
      }
    }, 5000);
  }

  private isPong(data: any): boolean {
    const pong = this.config.connection.pingFormat.response;
    if (typeof pong === "string") return data === pong;
    if (typeof pong === "object") {
      return Object.keys(pong).every((key) => data[key] === pong[key]);
    }
    return false;
  }

  private processTimestamp(obj: any): any {
    if (typeof obj === "string") return obj;
    const processed = JSON.parse(JSON.stringify(obj));
    for (const key in processed) {
      if (processed[key] === "timestamp") {
        processed[key] = Math.floor(Date.now() / 1000);
      }
    }
    return processed;
  }

  disconnect(): void {
    this.ws?.close();
    this.isConnected = false;
    console.log(`🔴 ${this.config.name} - ОТКЛЮЧЕНА`);
  }
}
