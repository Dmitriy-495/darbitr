// src/exchanges/ExchangeFactory.ts

/**
 * ⚡ ФАБРИКА БИРЖ - ПРОСТО И БЫСТРО
 */

import { BaseExchange } from "./BaseExchange";
import { ConfigLoader } from "../config/ConfigLoader";

export class ExchangeFactory {
  static async createAll(): Promise<BaseExchange[]> {
    console.log("🔧 СОЗДАЕМ БИРЖИ...");

    const names = ConfigLoader.getEnabledExchanges();
    const exchanges: BaseExchange[] = [];

    for (const name of names) {
      try {
        const config = ConfigLoader.loadExchangeConfig(name);
        const exchange = new BaseExchange(config);
        await exchange.connect();
        exchanges.push(exchange);
        console.log(`✅ ${name} - ГОТОВА`);
      } catch (error) {
        console.error(`❌ ${name} - ОШИБКА:`, error);
      }
    }

    console.log(`🎯 ГОТОВО: ${exchanges.length}/${names.length}`);
    return exchanges;
  }
}
