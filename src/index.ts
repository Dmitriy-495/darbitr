// src/index.ts
import { ExchangeFactory } from "./exchanges/ExchangeFactory";
import { Logger } from "./utils/Common";

async function start(): Promise<void> {
  Logger.info("🚀 DT ARBITR 3.0 - ЗАПУСК!");
  Logger.info("⚡ СКОРОСТЬ РЕШАЕТ ВСЕ! АРБИТРАЖ - НАША СТИХИЯ!");

  const exchanges = ExchangeFactory.createExchanges();
  Logger.info(`📊 Загружено бирж: ${exchanges.length}`);

  await Promise.all(exchanges.map((ex) => ex.connect()));
  Logger.success("✅ ВСЕ БИРЖИ ПОДКЛЮЧЕНЫ!");

  // Бесконечный режим
  process.on("SIGINT", () => {
    Logger.warning("Нажмите Ctrl+C еще раз для выхода");
    process.once("SIGINT", () => {
      exchanges.forEach((ex) => ex.disconnect());
      process.exit(0);
    });
  });
}

start().catch((error) => {
  Logger.error(`💥 Ошибка запуска: ${error}`);
  process.exit(1);
});
