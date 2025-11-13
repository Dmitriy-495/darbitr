// src/exchanges/ExchangeFactory.ts
import { BaseExchange } from "./BaseExchange";
import { ConfigLoader } from "../config";
import { Logger } from "../utils/Common";

export class ExchangeFactory {
  static createExchanges(): BaseExchange[] {
    const enabledExchanges = ConfigLoader.getEnabledExchanges();
    Logger.info(`🎯 Активные биржи: ${enabledExchanges.join(", ")}`);

    return enabledExchanges
      .map((exchangeId) => {
        const config = ConfigLoader.getExchangeConfig(exchangeId);
        return config ? this.createExchange(config) : null;
      })
      .filter(Boolean) as BaseExchange[];
  }

  private static createExchange(config: any): BaseExchange {
    return new (class extends BaseExchange {
      protected onMessage(data: any): void {
        if (this.isPongMessage(data)) {
          this.handlePong(data);
        }
      }

      protected isPongMessage(msg: any): boolean {
        const response = this.pingFormat.response;

        if (typeof response === "string") {
          return msg === response;
        }

        if (typeof response === "object") {
          for (const [key, value] of Object.entries(response)) {
            if (msg[key] !== value) return false;
          }
          return true;
        }

        return false;
      }
    })(config.name, config.wsUrl, config.pingIntervalMs, config.pingFormat);
  }
}
