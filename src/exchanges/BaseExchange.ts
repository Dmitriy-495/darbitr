// src/exchanges/BaseExchange.ts

/**
 * ⚡ БАЗОВЫЙ КЛАСС ДЛЯ ВСЕХ БИРЖ
 * ДЕВИЗ: "МИНИМАЛИЗМ - ЭТО СКОРОСТЬ!"
 */

export abstract class BaseExchange {
  protected ws: WebSocket | null = null;
  protected isConnected: boolean = false; // Флаг успешного подключения
  protected connectionChecked: boolean = false; // Флаг проверки подключения
  protected lastPingTime: number = 0; // Время последнего ping
  protected latency: number = 0; // Последняя задержка
  protected reconnectAttempts: number = 0; // Счетчик переподключений
  protected maxReconnectAttempts: number = 5; // Максимум переподключений

  /**
   * 🏗️ КОНСТРУКТОР - ИНИЦИАЛИЗАЦИЯ БИРЖИ
   */
  constructor(protected config: any) {
    console.log(`🎯 ИНИЦИАЛИЗИРУЕМ ${config.name}...`);
  }

  /**
   * 🔌 ПОДКЛЮЧЕНИЕ К БИРЖЕ
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`🔌 ПОДКЛЮЧАЕМСЯ К ${this.config.name}...`);

        this.ws = new WebSocket(this.config.wsUrl);

        // 📡 ОБРАБОТЧИК ОТКРЫТИЯ СОЕДИНЕНИЯ
        this.ws.onopen = () => {
          console.log(`✅ WebSocket ${this.config.name} ОТКРЫТ`);
          // Ждем подтверждения от биржи в onMessage
        };

        // 📨 ОБРАБОТЧИК ВХОДЯЩИХ СООБЩЕНИЙ
        this.ws.onmessage = (event) => {
          try {
            let data: any;

            // ПАРСИМ JSON ИЛИ СТРОКУ
            if (typeof event.data === "string") {
              data = event.data === "pong" ? "pong" : JSON.parse(event.data);
            } else {
              data = event.data;
            }

            this.onMessage(data);
          } catch (error) {
            console.error(`❌ ОШИБКА ПАРСИНГА СООБЩЕНИЯ:`, error);
          }
        };

        // 🔴 ОБРАБОТЧИК ОШИБОК
        this.ws.onerror = (error) => {
          console.error(`❌ ОШИБКА ${this.config.name}:`, error);
          reject(error);
        };

        // 📴 ОБРАБОТЧИК ЗАКРЫТИЯ СОЕДИНЕНИЯ
        this.ws.onclose = () => {
          console.log(`🔴 СОЕДИНЕНИЕ ${this.config.name} ЗАКРЫТО`);
          this.handleReconnect();
        };

        // ТАЙМАУТ НА ПОДКЛЮЧЕНИЕ
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error(`ТАЙМАУТ ПОДКЛЮЧЕНИЯ К ${this.config.name}`));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * ✅ ВЫЗЫВАЕТСЯ КОГДА БИРЖА ПОДТВЕРДИЛА ПОДКЛЮЧЕНИЕ
   */
  protected onConnected(): void {
    console.log(`🎉 ${this.config.name} ПОДКЛЮЧЕНА И ГОТОВА К БОЮ!`);
    this.isConnected = true;
    this.connectionChecked = true;
    this.reconnectAttempts = 0; // СБРАСЫВАЕМ СЧЕТЧИК ПЕРЕПОДКЛЮЧЕНИЙ

    // ЗАПУСКАЕМ PING-PONG ЦИКЛ ЧЕРЕЗ 1 СЕКУНДУ
    setTimeout(() => {
      this.startPingPong();
    }, 1000);
  }

  /**
   * 🔄 ОБРАБОТКА ПЕРЕПОДКЛЮЧЕНИЯ
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 ПЕРЕПОДКЛЮЧЕНИЕ ${this.config.name} (ПОПЫТКА ${this.reconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect();
      }, 2000 * this.reconnectAttempts); // УВЕЛИЧИВАЕМ ЗАДЕРЖКУ
    } else {
      console.error(
        `💥 ПРЕВЫШЕН ЛИМИТ ПЕРЕПОДКЛЮЧЕНИЙ ДЛЯ ${this.config.name}`
      );
    }
  }

  /**
   * 📨 ГЛАВНЫЙ ОБРАБОТЧИК ВСЕХ СООБЩЕНИЙ ОТ БИРЖИ
   */
  protected onMessage(data: any): void {
    // ЕСЛИ ЕЩЕ НЕ ПОДТВЕРЖДЕНО ПОДКЛЮЧЕНИЕ - ПРОВЕРЯЕМ
    if (!this.connectionChecked) {
      if (this.isConnectionConfirm(data)) {
        this.onConnected();
        return;
      }
    }

    // ЕСЛИ ПОДКЛЮЧЕНИЕ ПОДТВЕРЖДЕНО - ПРОВЕРЯЕМ PONG
    if (this.isConnected && this.isPong(data)) {
      this.handlePong(data);
      return;
    }

    // ВСЕ ОСТАЛЬНЫЕ СООБЩЕНИЯ - ДЛЯ БУДУЩЕГО ФУНКЦИОНАЛА
    this.handleOtherMessages(data);
  }

  /**
   * 🔍 ПРОВЕРЯЕТ - ЭТО ПОДТВЕРЖДЕНИЕ ПОДКЛЮЧЕНИЯ ОТ БИРЖИ?
   */
  private isConnectionConfirm(data: any): boolean {
    // BYBIT: {"success":true,"ret_msg":"...","conn_id":"..."}
    if (data.success === true) {
      console.log(`📨 ${this.config.name} ПРИСЛАЛА ПОДТВЕРЖДЕНИЕ ПОДКЛЮЧЕНИЯ`);
      return true;
    }

    // OKX: {"event":"subscribe","channel":"..."}
    if (data.event === "subscribe") {
      console.log(`📨 ${this.config.name} ПОДТВЕРДИЛА ПОДПИСКУ`);
      return true;
    }

    // GATE.IO: ПЕРВЫЙ PONG ТАКЖЕ ПОДТВЕРЖДАЕТ ПОДКЛЮЧЕНИЕ
    if (this.isPong(data)) {
      console.log(`📨 ${this.config.name} ПРИСЛАЛА PONG КАК ПОДТВЕРЖДЕНИЕ`);
      return true;
    }

    return false;
  }

  /**
   * 🎯 ОПРЕДЕЛЯЕТ - ЭТО PONG ОТВЕТ?
   */
  private isPong(data: any): boolean {
    const pongConfig = this.config.connection.pingFormat.response;

    // ДЛЯ OKX: "pong" - ПРОСТАЯ СТРОКА
    if (typeof pongConfig === "string") {
      return data === pongConfig;
    }

    // ДЛЯ BYBIT И GATE.IO: СЛОЖНЫЙ JSON ОБЪЕКТ
    if (typeof pongConfig === "object") {
      return Object.keys(pongConfig).every(
        (key) => data[key] === pongConfig[key]
      );
    }

    return false;
  }

  /**
   * 🚀 ЗАПУСКАЕТ PING-PONG ЦИКЛ
   */
  private startPingPong(): void {
    if (!this.isConnected) return;

    console.log(`🔁 ЗАПУСК PING-PONG ДЛЯ ${this.config.name}`);

    // НЕМЕДЛЕННО ОТПРАВЛЯЕМ ПЕРВЫЙ PING
    this.sendPing();

    // ЗАПУСКАЕМ ИНТЕРВАЛ
    setInterval(() => {
      if (this.isConnected) {
        this.sendPing();
      }
    }, this.config.connection.pingIntervalMs);
  }

  /**
   * 📤 ОТПРАВЛЯЕТ PING ЗАПРОС
   */
  protected sendPing(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log(`⚠️ WebSocket ${this.config.name} НЕ ГОТОВ ДЛЯ PING`);
      return;
    }

    const pingMessage = this.config.connection.pingFormat.request;

    // ОТПРАВЛЯЕМ PING В ЗАВИСИМОСТИ ОТ ФОРМАТА
    if (typeof pingMessage === "string") {
      this.ws.send(pingMessage);
    } else {
      // ДЛЯ JSON С ЗАМЕНОЙ timestamp
      const message = { ...pingMessage };
      if (message.time === "timestamp") {
        message.time = Math.floor(Date.now() / 1000);
      }
      this.ws.send(JSON.stringify(message));
    }

    this.lastPingTime = Date.now();
    console.log(`📤 ${this.config.name} PING ОТПРАВЛЕН`);

    // ТАЙМАУТ НА ОЖИДАНИЕ PONG
    setTimeout(() => {
      if (this.lastPingTime > 0) {
        console.log(`⏰ ${this.config.name} PONG ТАЙМАУТ - НЕТ ОТВЕТА`);
        this.lastPingTime = 0;
      }
    }, 5000);
  }

  /**
   * 📥 ОБРАБОТКА PONG ОТВЕТА
   */
  protected handlePong(data: any): void {
    const latency = Date.now() - this.lastPingTime;
    this.latency = latency;
    this.lastPingTime = 0;

    console.log(`📥 ${this.config.name} PONG ПОЛУЧЕН! ЗАДЕРЖКА: ${latency}ms`);
  }

  /**
   * 📊 ПОЛУЧЕНИЕ СТАТИСТИКИ БИРЖИ
   */
  getStats(): any {
    return {
      name: this.config.name,
      connected: this.isConnected,
      latency: this.latency,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * 🔧 ОБРАБОТКА ДРУГИХ СООБЩЕНИЙ (ДЛЯ НАСЛЕДНИКОВ)
   */
  protected handleOtherMessages(data: any): void {
    // ПЕРЕОПРЕДЕЛЯЕТСЯ В КОНКРЕТНЫХ БИРЖАХ
    // console.log(`📨 ${this.config.name} ДРУГОЕ СООБЩЕНИЕ:`, data);
  }

  /**
   * 📴 ОТКЛЮЧЕНИЕ ОТ БИРЖИ
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.connectionChecked = false;
    console.log(`🔴 ${this.config.name} ОТКЛЮЧЕНА`);
  }
}
