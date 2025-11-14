// src/index.ts

/**
 * ⚡ ГЛАВНЫЙ ФАЙЛ ЗАПУСКА СИСТЕМЫ
 * ДЕВИЗ: "КОГДА МЫ ЕДИНЫ, БИРЖИ ПОБЕДИМЫ!"
 */

import { ExchangeFactory } from "./exchanges/ExchangeFactory";
import { BaseExchange } from "./exchanges/BaseExchange";

class DArbitrApp {
  private exchanges: BaseExchange[] = [];
  private isRunning: boolean = false;

  /**
   * 🚀 ЗАПУСК ПРИЛОЖЕНИЯ
   */
  async start(): Promise<void> {
    console.log("🎯 DT ARBITR 3.0 - ЗАПУСК!");
    console.log("⚡ СКОРОСТЬ РЕШАЕТ ВСЕ!");
    console.log("💥 ПОРВЕМ ЭТИ БИРЖИ К ЧЕРТЯМ СОБАЧЬИМ!!!\n");

    // ПАРСИМ АРГУМЕНТЫ КОМАНДНОЙ СТРОКИ
    const args = process.argv.slice(2);
    const mode = args.includes("battle") ? "battle" : "test";

    console.log(`🔧 РЕЖИМ: ${mode.toUpperCase()}`);

    try {
      if (mode === "test") {
        await this.runTestMode();
      } else {
        await this.runBattleMode();
      }
    } catch (error) {
      console.error("💥 КРИТИЧЕСКАЯ ОШИБКА:", error);
      process.exit(1);
    }
  }

  /**
   * 🧪 ТЕСТОВЫЙ РЕЖИМ - ПРОВЕРКА ПОДКЛЮЧЕНИЯ
   */
  private async runTestMode(): Promise<void> {
    console.log("\n🎯 ЗАПУСК ТЕСТОВОГО РЕЖИМА - ПРОВЕРКА ПОДКЛЮЧЕНИЯ БИРЖ!");

    // ИНИЦИАЛИЗИРУЕМ БИРЖИ
    this.exchanges = await this.initializeExchanges();

    console.log("\n📊 МОНИТОРИНГ СТАТУСА ПОДКЛЮЧЕНИЯ:");

    // ЗАПУСКАЕМ ВЫВОД СТАТУСА КАЖДЫЕ 3 СЕКУНДЫ
    const statusInterval = setInterval(() => {
      this.printStatus();
    }, 3000);

    // АВТОМАТИЧЕСКОЕ ЗАВЕРШЕНИЕ ЧЕРЕЗ 60 СЕКУНД
    setTimeout(() => {
      clearInterval(statusInterval);
      console.log("\n🎯 ТЕСТОВЫЙ РЕЖИМ ЗАВЕРШЕН!");
      this.shutdown();
    }, 60000);

    // ОБРАБОТКА CTRL+C
    process.on("SIGINT", () => {
      console.log("\n🛑 ПОЛУЧЕНА КОМАНДА ОСТАНОВКИ...");
      clearInterval(statusInterval);
      this.shutdown();
    });
  }

  /**
   * ⚔️ БОЕВОЙ РЕЖИМ - РЕАЛЬНАЯ ТОРГОВЛЯ
   */
  private async runBattleMode(): Promise<void> {
    console.log("\n⚔️ ЗАПУСК БОЕВОГО РЕЖИМА - РЕАЛЬНАЯ ТОРГОВЛЯ!");
    console.log("🚨 ВНИМАНИЕ: ИСПОЛЬЗУЮТСЯ РЕАЛЬНЫЕ API КЛЮЧИ!");

    // TODO: РЕАЛИЗОВАТЬ БОЕВОЙ РЕЖИМ
    this.exchanges = await this.initializeExchanges();

    console.log("\n🎯 БОЕВОЙ РЕЖИМ АКТИВИРОВАН!");
    console.log("📊 МОНИТОРИНГ СТАТУСА:");

    const statusInterval = setInterval(() => {
      this.printStatus();
    }, 5000);

    // БЕСКОНЕЧНАЯ РАБОТА ДО РУЧНОЙ ОСТАНОВКИ
    process.on("SIGINT", () => {
      console.log("\n🛑 ОСТАНОВКА БОЕВОГО РЕЖИМА...");
      clearInterval(statusInterval);
      this.shutdown();
    });
  }

  /**
   * 🔧 ИНИЦИАЛИЗАЦИЯ ВСЕХ БИРЖ
   */
  private async initializeExchanges(): Promise<BaseExchange[]> {
    console.log("\n🔧 ИНИЦИАЛИЗАЦИЯ БИРЖ...");

    const exchanges: BaseExchange[] = [];

    try {
      // СОЗДАЕМ ВСЕ ВКЛЮЧЕННЫЕ БИРЖИ
      const enabledExchanges = await ExchangeFactory.createEnabledExchanges();

      // ПОДКЛЮЧАЕМСЯ К КАЖДОЙ БИРЖЕ
      for (const exchange of enabledExchanges) {
        try {
          await exchange.connect();
          exchanges.push(exchange);
        } catch (error) {
          console.error(
            `❌ ОШИБКА ПОДКЛЮЧЕНИЯ ${exchange.config.name}:`,
            error
          );
        }
      }

      console.log(`✅ УСПЕШНО ПОДКЛЮЧЕНО: ${exchanges.length} БИРЖ`);
      return exchanges;
    } catch (error) {
      console.error("💥 ОШИБКА ИНИЦИАЛИЗАЦИИ БИРЖ:", error);
      throw error;
    }
  }

  /**
   * 📊 ВЫВОД ТЕКУЩЕГО СТАТУСА ВСЕХ БИРЖ
   */
  private printStatus(): void {
    console.log("\n--- 📊 СТАТУС ПОДКЛЮЧЕНИЯ БИРЖ ---");

    this.exchanges.forEach((exchange, index) => {
      const stats = exchange.getStats();
      const status = stats.connected ? "✅ ГОТОВ" : "🔄 ПОДКЛЮЧЕНИЕ";
      const latency = stats.latency ? `${stats.latency}ms` : "---";
      const reconnects = stats.reconnectAttempts || 0;

      console.log(
        `${index + 1}. ${
          stats.name
        }: ${status} | Задержка: ${latency} | Переподкл: ${reconnects}`
      );
    });

    console.log("----------------------------------");
  }

  /**
   * 📴 КОРРЕКТНОЕ ЗАВЕРШЕНИЕ РАБОТЫ
   */
  private shutdown(): void {
    console.log("\n📴 ЗАВЕРШЕНИЕ РАБОТЫ DT ARBITR 3.0...");

    // ОТКЛЮЧАЕМ ВСЕ БИРЖИ
    this.exchanges.forEach((exchange) => {
      try {
        exchange.disconnect();
      } catch (error) {
        console.error(`❌ ОШИБКА ОТКЛЮЧЕНИЯ ${exchange.config.name}:`, error);
      }
    });

    console.log("🎯 DT ARBITR 3.0 ОСТАНОВЛЕН!");
    console.log("⚡ ДО СКОРОЙ ВСТРЕЧИ НА ПОЛЯХ АРБИТРАЖНЫХ БОЕВ!");
    process.exit(0);
  }
}

// 🚀 ЗАПУСК ПРИЛОЖЕНИЯ
const app = new DArbitrApp();
app.start().catch(console.error);
