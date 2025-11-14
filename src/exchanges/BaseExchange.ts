// src/exchanges/BaseExchange.ts

/**
 * ⚡ УНИВЕСАЛЬНЫЙ КЛАСС БИРЖИ
 * ДЕВИЗ: "ПРОЩЕ! ЭФФЕКТИВНЕЙ! БЫСТРЕЕ!"
 */

import WebSocket from "ws";

export class BaseExchange {
  protected ws: WebSocket | null = null;
  protected isConnected: boolean = false;
  protected lastPingTime: number = 0;
  protected latency: number = 0;
  private orderbookUpdateCount: number = 0;
  private lastOrderbookData: any = null;

  /**
   * 🏗️ КОНСТРУКТОР - ПРОСТО И БЫСТРО
   */
  constructor(protected config: any) {
    console.log(`🎯 ${config.name} - ИНИЦИАЛИЗИРОВАНА`);
  }

  /**
   * 🔌 ПОДКЛЮЧЕНИЕ - ПРОЩЕ НЕКУДА
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🔌 ${this.config.name} - ПОДКЛЮЧЕНИЕ...`);

      this.ws = new WebSocket(this.config.wsUrl);

      this.ws.onopen = () => {
        console.log(`✅ ${this.config.name} - WebSocket ОТКРЫТ`);
        this.handleConnected();
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
          this.handleMessage(data);
        } catch (error) {
          console.error(`❌ ${this.config.name} - ОШИБКА ПАРСИНГА:`, error);
        }
      };

      this.ws.onerror = (error) => {
        console.error(`❌ ${this.config.name} - ОШИБКА:`, error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log(`🔴 ${this.config.name} - СОЕДИНЕНИЕ ЗАКРЫТО`);
        this.isConnected = false;
      };

      // ТАЙМАУТ 10 СЕКУНД
      setTimeout(
        () => !this.isConnected && reject(new Error("ТАЙМАУТ")),
        10000
      );
    });
  }

  /**
   * ✅ ОБРАБОТКА УСПЕШНОГО ПОДКЛЮЧЕНИЯ
   */
  private handleConnected(): void {
    console.log(`🎉 ${this.config.name} - ПОДКЛЮЧЕНА К БОЮ!`);
    this.isConnected = true;

    // ЗАПУСКАЕМ PING-PONG И ПОДПИСКИ
    setTimeout(() => {
      this.startPingPong();
      this.sendSubscriptions();
    }, 1000);
  }

  /**
   * 📨 ОБРАБОТКА ВСЕХ СООБЩЕНИЙ - ЭФФЕКТИВНО
   */
  private handleMessage(data: any): void {
    // ПРОВЕРЯЕМ PONG
    if (this.isPong(data)) {
      this.handlePong(data);
      return;
    }

    // ПРОВЕРЯЕМ ПОДТВЕРЖДЕНИЕ ПОДПИСКИ
    if (this.isSubscriptionConfirm(data)) {
      console.log(`✅ ${this.config.name} - ПОДПИСКА ПОДТВЕРЖДЕНА`);
      return;
    }

    // ОБРАБАТЫВАЕМ ДАННЫЕ
    this.handleData(data);
  }

  /**
   * 🎯 ПРОВЕРКА PONG - БЫСТРО
   */
  private isPong(data: any): boolean {
    const pongConfig = this.config.connection.pingFormat.response;

    if (typeof pongConfig === "string") {
      return data === pongConfig;
    }

    if (typeof pongConfig === "object") {
      return Object.keys(pongConfig).every(
        (key) => data[key] === pongConfig[key]
      );
    }

    return false;
  }

  /**
   * 📨 ПРОВЕРКА ПОДТВЕРЖДЕНИЯ ПОДПИСКИ
   */
  private isSubscriptionConfirm(data: any): boolean {
    return data.event === "subscribe" || data.success === true;
  }

  /**
   * 🚀 ЗАПУСК PING-PONG - ЭФФЕКТИВНО
   */
  private startPingPong(): void {
    if (!this.isConnected) return;

    console.log(`🔁 ${this.config.name} - PING-PONG ЗАПУЩЕН`);

    // ПЕРВЫЙ PING
    this.sendPing();

    // ИНТЕРВАЛ ИЗ КОНФИГА
    setInterval(
      () => this.isConnected && this.sendPing(),
      this.config.connection.pingIntervalMs
    );
  }

  /**
   * 📤 ОТПРАВКА PING - ПРОСТО
   */
  private sendPing(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const pingMessage = this.config.connection.pingFormat.request;

    if (typeof pingMessage === "string") {
      this.ws.send(pingMessage);
    } else {
      // ЗАМЕНА timestamp
      const message = { ...pingMessage };
      if (message.time === "timestamp") {
        message.time = Math.floor(Date.now() / 1000);
      }
      this.ws.send(JSON.stringify(message));
    }

    this.lastPingTime = Date.now();
    console.log(`📤 ${this.config.name} - PING ОТПРАВЛЕН`);

    // ТАЙМАУТ 5 СЕКУНД
    setTimeout(() => {
      if (this.lastPingTime > 0) {
        console.log(`⏰ ${this.config.name} - PONG ТАЙМАУТ`);
        this.lastPingTime = 0;
      }
    }, 5000);
  }

  /**
   * 📥 ОБРАБОТКА PONG ОТВЕТА - С ФРАЗОЙ "ОТКЛИК"
   */
  private handlePong(data: any): void {
    const latency = Date.now() - this.lastPingTime;
    this.latency = latency;
    this.lastPingTime = 0;

    console.log(`📥 ${this.config.name} PONG! отклик: ${latency}ms`);
  }

  /**
   * 📨 ОТПРАВКА ПОДПИСОК - ПРОЩЕ НЕКУДА
   */
  private sendSubscriptions(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    if (this.config.subscribeMessages) {
      this.config.subscribeMessages.forEach((message: any) => {
        const processed = this.processMessage(message);
        this.ws!.send(JSON.stringify(processed));
        console.log(`📨 ${this.config.name} - ПОДПИСКА ОТПРАВЛЕНА`);
      });
    }
  }

  /**
   * 🛠️ ОБРАБОТКА ШАБЛОНОВ СООБЩЕНИЙ
   */
  private processMessage(message: any): any {
    const processed = JSON.parse(JSON.stringify(message));

    for (const key in processed) {
      if (processed[key] === "timestamp") {
        processed[key] = Math.floor(Date.now() / 1000);
      }
    }

    return processed;
  }

  /**
   * 📊 ОБРАБОТКА ДАННЫХ - С ФИЛЬТРАЦИЕЙ СТАКАНА
   */
  private handleData(data: any): void {
    // ОБРАБАТЫВАЕМ ORDERBOOK
    if (
      data.channel?.includes("order_book") ||
      data.topic?.includes("orderbook")
    ) {
      this.handleOrderbookWithFilter(data);
    }
  }

  /**
   * 📊 ФИЛЬТРАЦИЯ СТАКАНА - КАЖДЫЕ 20 ОБНОВЛЕНИЙ + BEST BID/ASK
   */
  private handleOrderbookWithFilter(data: any): void {
    this.orderbookUpdateCount++;

    // ПРОПУСКАЕМ КАЖДЫЕ 19 ОБНОВЛЕНИЙ
    if (this.orderbookUpdateCount % 20 !== 0) {
      return;
    }

    // СОХРАНЯЕМ ПОСЛЕДНИЕ ДАННЫЕ
    this.lastOrderbookData = data;

    // ИЗВЛЕКАЕМ BEST BID/ASK
    const bestBidAsk = this.extractBestBidAsk(data);

    if (bestBidAsk) {
      console.log(
        `📊 ${this.config.name} BEST: BID ${bestBidAsk.bid} | ASK ${bestBidAsk.ask} | спред: ${bestBidAsk.spread}`
      );
    }
  }

  /**
   * 🎯 ИЗВЛЕЧЕНИЕ BEST BID/ASK ИЗ РАЗНЫХ ФОРМАТОВ БИРЖ
   */
  private extractBestBidAsk(
    data: any
  ): { bid: number; ask: number; spread: number } | null {
    try {
      let bestBid: number = 0;
      let bestAsk: number = 0;

      // BYBIT ФОРМАТ
      if (data.type === "snapshot" && data.data) {
        const bids = data.data.b || data.data.bids || [];
        const asks = data.data.a || data.data.asks || [];

        if (bids.length > 0) bestBid = parseFloat(bids[0][0]);
        if (asks.length > 0) bestAsk = parseFloat(asks[0][0]);
      }
      // GATE.IO ФОРМАТ
      else if (data.result && Array.isArray(data.result)) {
        const orderbook = data.result[0];
        if (orderbook && orderbook.bids && orderbook.asks) {
          if (orderbook.bids.length > 0)
            bestBid = parseFloat(orderbook.bids[0][0]);
          if (orderbook.asks.length > 0)
            bestAsk = parseFloat(orderbook.asks[0][0]);
        }
      }
      // OKX ФОРМАТ
      else if (data.data && Array.isArray(data.data)) {
        const orderbook = data.data[0];
        if (orderbook && orderbook.bids && orderbook.asks) {
          if (orderbook.bids.length > 0)
            bestBid = parseFloat(orderbook.bids[0][0]);
          if (orderbook.asks.length > 0)
            bestAsk = parseFloat(orderbook.asks[0][0]);
        }
      }

      // ПРОВЕРЯЕМ ЧТО ДАННЫЕ ВАЛИДНЫ
      if (bestBid > 0 && bestAsk > 0 && bestAsk > bestBid) {
        const spread = bestAsk - bestBid;
        return { bid: bestBid, ask: bestAsk, spread };
      }
    } catch (error) {
      console.error(
        `❌ ${this.config.name} - ОШИБКА ИЗВЛЕЧЕНИЯ BID/ASK:`,
        error
      );
    }

    return null;
  }

  /**
   * 📈 СТАТИСТИКА - ТЕПЕРЬ С BEST BID/ASK
   */
  getStats(): any {
    let bestInfo = "";

    if (this.lastOrderbookData) {
      const bestBidAsk = this.extractBestBidAsk(this.lastOrderbookData);
      if (bestBidAsk) {
        bestInfo = ` | BID:${bestBidAsk.bid} ASK:${bestBidAsk.ask}`;
      }
    }

    return {
      name: this.config.name,
      connected: this.isConnected,
      latency: this.latency,
      bestInfo: bestInfo,
    };
  }

  /**
   * 📴 ОТКЛЮЧЕНИЕ - ПРОСТО
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    console.log(`🔴 ${this.config.name} - ОТКЛЮЧЕНА`);
  }
}
