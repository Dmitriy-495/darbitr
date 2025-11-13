import { BaseExchange } from "./BaseExchange";

export class ExchangeFactory {
  public static createExchange(config: any): BaseExchange {
    return new (class extends BaseExchange {
      private pingFormat: any;
      private subscribeConfig: any;

      constructor() {
        super(config.name, config.wsUrl);
        this.pingFormat = config.pingFormat;
        this.subscribeConfig = config.subscribe;
      }

      protected onReady(): void {
        // УНИВЕРСАЛЬНАЯ ПОДПИСКА ДЛЯ БИРЖ, КОТОРЫЕ ТРЕБУЮТ ЕЕ
        if (this.subscribeConfig) {
          this.send(this.subscribeConfig);
          console.log(`📡 ${this.name}: подписка отправлена`);
        }
      }

      protected isPongMessage(msg: any): boolean {
        const pattern = this.pingFormat.response;
        for (const [key, value] of Object.entries(pattern)) {
          if (msg[key] !== value) return false;
        }
        return true;
      }

      protected sendPing(): void {
        this.pingTime = Date.now();
        const request = { ...this.pingFormat.request };

        for (const [key, value] of Object.entries(request)) {
          if (value === "timestamp") {
            request[key] = Math.floor(this.pingTime / 1000);
          }
        }

        this.send(request);
      }
    })();
  }
}
