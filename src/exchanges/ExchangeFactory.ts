// src/exchanges/ExchangeFactory.ts

/**
 * ⚡ ФАБРИКА БИРЖ - ТЕПЕРЬ С ПОДКЛЮЧЕНИЕМ!
 */

import { BaseExchange } from "./BaseExchange";
import { ConfigLoader } from "../config/ConfigLoader";

export class ExchangeFactory {
  /**
   * 🏗️ СОЗДАЕМ И ПОДКЛЮЧАЕМ БИРЖУ
   */
  static async createExchange(exchangeName: string): Promise<BaseExchange> {
    const config = ConfigLoader.loadExchangeConfig(exchangeName);

    console.log(`🏗️ ${config.name} - СОЗДАНА`);
    const exchange = new BaseExchange(config);

    // 🔌 НЕМЕДЛЕННО ПОДКЛЮЧАЕМ!
    await exchange.connect();

    return exchange;
  }

  /**
   * 🔧 СОЗДАЕМ И ПОДКЛЮЧАЕМ ВСЕ БИРЖИ
   */
  static async createEnabledExchanges(): Promise<BaseExchange[]> {
    console.log("🔧 СОЗДАЕМ И ПОДКЛЮЧАЕМ БИРЖИ ИЗ enabled/...");

    const enabled = ConfigLoader.getEnabledExchanges();
    const exchanges: BaseExchange[] = [];

    console.log(`📊 НАЙДЕНО: ${enabled.length} БИРЖ`);

    // СОЗДАЕМ И ПОДКЛЮЧАЕМ КАЖДУЮ БИРЖУ
    for (const name of enabled) {
      try {
        const exchange = await this.createExchange(name);
        exchanges.push(exchange);
        console.log(`✅ ${name} - СОЗДАНА И ПОДКЛЮЧЕНА`);
      } catch (error) {
        console.error(`❌ ${name} - ОШИБКА ПОДКЛЮЧЕНИЯ:`, error);
      }
    }

    console.log(`🎯 УСПЕШНО: ${exchanges.length}/${enabled.length}`);
    return exchanges;
  }

  static getEnabledExchanges(): string[] {
    return ConfigLoader.getEnabledExchanges();
  }
}
