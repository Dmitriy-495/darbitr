// src/index.ts - УПРОЩАЕМ ДО МИНИМУМА!

/**
 * ⚡ ГЛАВНЫЙ ЗАПУСК - БЕЗ ЛИШНЕГО СТАТУСА!
 */

import { ExchangeFactory } from "./exchanges/ExchangeFactory";

class DArbitrApp {
  private exchanges: any[] = [];

  async start(): Promise<void> {
    console.log("🎯 DT ARBITR 3.0 - ЗАПУСК!");
    console.log("⚡ МИНИМАЛЬНЫЕ ЛОГИ! МАКСИМАЛЬНАЯ СКОРОСТЬ!\n");

    this.exchanges = await ExchangeFactory.createAll();

    // ⚡ НЕТ ИНТЕРВАЛА СТАТУСА - ВСЁ ВИДНО В PONG!

    // AUTOSTOP ЧЕРЕЗ 30 СЕК
    setTimeout(() => {
      console.log("🎯 ТЕСТ ЗАВЕРШЕН!");
      this.shutdown();
    }, 30000);

    process.on("SIGINT", () => {
      this.shutdown();
    });
  }

  private shutdown(): void {
    this.exchanges.forEach((ex) => ex.disconnect());
    console.log("🎯 СИСТЕМА ОСТАНОВЛЕНА!");
    process.exit(0);
  }
}

new DArbitrApp().start().catch(console.error);
