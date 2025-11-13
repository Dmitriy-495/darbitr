/**
 * @file src/index.ts
 * @path ./src/index.ts
 * @brief Главный входной файл DT Arbitr 3.0
 * @version 3.0.0
 *
 * ОСНОВНАЯ ФУНКЦИЯ: Запуск арбитражного бота в бесконечном режиме
 * ВЫХОД: Ctrl+C с подтверждением
 */

import process from "process";
import { CONFIG } from "./config/index";
import { ExchangeFactory } from "./exchanges/ExchangeFactory";

/**
 * Запускает приложение в выбранном режиме
 * @param mode - Режим работы: 'test' | 'battle'
 */
function launchApp(mode: "test" | "battle" = "test"): void {
  console.log("🚀 DT ARBITR 3.0 - ЗАПУСК!");
  console.log(`📟 Режим: ${mode.toUpperCase()}`);
  console.log("⚡ СКОРОСТЬ РЕШАЕТ ВСЕ! АРБИТРАЖ - НАША СТИХИЯ! 🔥");
  console.log("⏹️  Для выхода нажмите Ctrl+C");

  if (mode === "test") {
    startTestMode();
  } else {
    startBattleMode();
  }
}

/**
 * Запускает тестовый режим работы
 */
function startTestMode(): void {
  console.log("🔬 ТЕСТОВЫЙ РЕЖИМ - АКТИВИРОВАН");

  // АВТОМАТИЧЕСКИ ЗАПУСКАЕМ ВСЕ БИРЖИ ИЗ КОНФИГА
  const exchanges = CONFIG.EXCHANGES.map((exchangeConfig) => {
    console.log(`🚀 Запуск биржи: ${exchangeConfig.name}`);

    // ФАБРИКА СОЗДАЕТ БИРЖУ ПО КОНФИГУ
    const exchange = ExchangeFactory.createExchange(exchangeConfig);
    exchange.connect();

    return exchange;
  });

  console.log(
    `📊 Загружено бирж: ${exchanges.length}, пар: ${CONFIG.TRADING_PAIRS.length}`
  );
  console.log("🔄 Бот работает в бесконечном режиме");

  // Обработчик выхода
  setupExitHandler(() => {
    console.log("🔌 Отключаем все биржи...");
    exchanges.forEach((ex) => ex.disconnect());
    console.log("👋 До свидания!");
    process.exit(0);
  });
}

/**
 * Запускает боевой режим работы
 */
function startBattleMode(): void {
  console.log("🎯 БОЕВОЙ РЕЖИМ - НАЧАЛО РАБОТЫ");
  console.log("⚠️  ВНИМАНИЕ: Реальные торговые операции!");
  console.log("🔥 ПОРВЕМ ЭТИ БИРЖИ К ЧЕРТЯМ СОБАЧЬИМ!!!");

  // Обработчик выхода
  setupExitHandler(() => {
    console.log("🛑 ОСТАНОВКА БОЕВОГО РЕЖИМА!");
    console.log("👋 До свидания!");
    process.exit(0);
  });
}

/**
 * Настраивает обработчик выхода по Ctrl+C
 * @param onExit - Функция для выполнения при выходе
 */
function setupExitHandler(onExit: () => void): void {
  let isExiting = false;

  process.on("SIGINT", () => {
    if (isExiting) {
      console.log("⏩ Принудительный выход...");
      process.exit(0);
      return;
    }

    isExiting = true;
    console.log(
      "\n❓ Вы уверены, что хотите выйти? Нажмите Ctrl+C еще раз для подтверждения."
    );

    setTimeout(() => {
      isExiting = false;
      console.log("✅ Продолжаем работу...");
    }, 3000);

    // Второе нажатие - подтверждение выхода
    process.once("SIGINT", onExit);
  });
}

/**
 * Анализирует аргументы командной строки
 * @returns Режим работы
 */
function parseCommandLineArgs(): { mode: "test" | "battle" } {
  const args = process.argv.slice(2);
  let mode: "test" | "battle" = "test";

  if (args.includes("battle")) {
    mode = "battle";
  } else if (args.includes("test")) {
    mode = "test";
  }

  return { mode };
}

// ЗАПУСК ПРИЛОЖЕНИЯ
try {
  const { mode } = parseCommandLineArgs();
  launchApp(mode);
} catch (error) {
  console.error("💥 КРИТИЧЕСКАЯ ОШИБКА ПРИ ЗАПУСКЕ:");
  console.error(error);
  process.exit(1);
}
