/**
 * @file src/config/index.ts
 * @path ./src/config/index.ts
 * @brief Объединение настроек из .env и exchanges.json
 * @version 3.0.0
 */

import { config } from "dotenv";
import exchangesConfig from "./exchanges.json";

config();

export interface ExchangeConfig {
  id: string;
  name: string;
  wsUrl: string;
  enabled: boolean;
  pingIntervalMs: number;
  apiKey?: string;
  apiSecret?: string;
  pingFormat: any;
  orderBook?: any;
}

export interface TradingPair {
  symbol: string;
  base: string;
  quote: string;
  enabled: boolean;
}

class ConfigLoader {
  private exchanges: ExchangeConfig[] = [];
  private tradingPairs: TradingPair[] = [];

  constructor() {
    this.loadExchanges();
  }

  /**
   * Объединяет настройки из .env и exchanges.json
   */
  private loadExchanges(): void {
    for (const [exchangeId, exchangeConfig] of Object.entries(
      exchangesConfig
    )) {
      const enabled = (exchangeConfig as any).enabled;

      if (enabled) {
        // Берем API ключи из .env
        const apiKey = process.env[`${exchangeId}.API_KEY`];
        const apiSecret = process.env[`${exchangeId}.API_SECRET`];

        this.exchanges.push({
          id: exchangeId,
          name: (exchangeConfig as any).name,
          wsUrl: (exchangeConfig as any).wsUrl,
          enabled: true,
          pingIntervalMs: (exchangeConfig as any).pingIntervalMs,
          apiKey,
          apiSecret,
          pingFormat: (exchangeConfig as any).pingFormat,
          orderBook: (exchangeConfig as any).orderBook,
        });

        console.log(
          `✅ Биржа ${exchangeId}: загружена ${apiKey ? "(с API)" : ""}`
        );
      } else {
        console.log(`❌ Биржа ${exchangeId}: отключена в конфиге`);
      }
    }
  }

  public getEnabledExchanges(): ExchangeConfig[] {
    return this.exchanges;
  }

  public getEnabledTradingPairs(): TradingPair[] {
    return this.tradingPairs;
  }

  public getArbitrageSettings() {
    return {
      minSpread: parseFloat(process.env["ARBITRAGE.MIN_SPREAD"] || "0.001"),
      updateIntervalMs: parseInt(
        process.env["ARBITRAGE.UPDATE_INTERVAL_MS"] || "100"
      ),
    };
  }
}

export const configLoader = new ConfigLoader();

export const CONFIG = {
  get EXCHANGES() {
    return configLoader.getEnabledExchanges();
  },
  get TRADING_PAIRS() {
    return configLoader.getEnabledTradingPairs();
  },
  get ARBITRAGE() {
    return configLoader.getArbitrageSettings();
  },
};
