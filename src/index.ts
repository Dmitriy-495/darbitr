// src/index.ts

/**
 * ⚡ ГЛАВНЫЙ ЗАПУСК - БЫСТРО И ПРОСТО
 * ДЕВИЗ: "ПРОЩЕ! ЭФФЕКТИВНЕЙ! БЫСТРЕЕ!"
 */

import { ExchangeFactory } from "./exchanges/ExchangeFactory";
import { BaseExchange } from "./exchanges/BaseExchange";

class DArbitrApp {
  private exchanges: BaseExchange[] = [];

  /**
   * 🚀 ЗАПУСК - ЭФФЕКТИВНО
   */
  async start(): Promise<void> {
    console.log("🎯 DT ARBITR 3.0 - ЗАПУСК!");
    console.log("⚡ ПРОЩЕ! ЭФФЕКТИВНЕЙ! БЫСТРЕЕ!\n");

    try {
      await this.runTestMode();
    } catch (error) {
      console.error("💥 ОШИБКА:", error);
      process.exit(1);
    }
  }

  /**
   * 🧪 ТЕСТОВЫЙ РЕЖИМ - ПРОСТО
   */
  private async runTestMode(): Promise<void> {
    console.log("🎯 ТЕСТ ПОДКЛЮЧЕНИЯ БИРЖ...");

    this.exchanges = await ExchangeFactory.createEnabledExchanges();

    // МОНИТОРИНГ СТАТУСА
    const interval = setInterval(() => {
      this.printStatus();
    }, 3000);

    // АВТОСТОП ЧЕРЕЗ 60 СЕК
    setTimeout(() => {
      clearInterval(interval);
      console.log("🎯 ТЕСТ ЗАВЕРШЕН!");
      this.shutdown();
    }, 60000);

    // CTRL+C
    process.on("SIGINT", () => {
      clearInterval(interval);
      this.shutdown();
    });
  }

  /**
   * 📊 ВЫВОД СТАТУСА - С BEST BID/ASK
   */
  private printStatus(): void {
    console.log("\n--- 📊 СТАТУС ПОДКЛЮЧЕНИЯ БИРЖ ---");

    this.exchanges.forEach((exchange, index) => {
      const stats = exchange.getStats();
      const status = stats.connected ? "✅" : "🔄";
      const latency = stats.latency ? `${stats.latency}ms` : "---";

      console.log(
        `${index + 1}. ${stats.name}: ${status} ${latency}${stats.bestInfo}`
      );
    });

    console.log("----------------------------------");
  }

  /**
   * 📴 ВЫКЛЮЧЕНИЕ - БЫСТРО
   */
  private shutdown(): void {
    console.log("📴 ВЫКЛЮЧЕНИЕ...");
    this.exchanges.forEach((ex) => ex.disconnect());
    console.log("🎯 СИСТЕМА ОСТАНОВЛЕНА!");
    process.exit(0);
  }
}

// 🚀 ЗАПУСКАЕМ!
const app = new DArbitrApp();
app.start().catch(console.error);
