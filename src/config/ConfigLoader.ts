// src/config/ConfigLoader.ts

/**
 * ⚡ ЗАГРУЗЧИК КОНФИГОВ APACHE-STYLE
 * ДЕВИЗ: "ПРАВИЛЬНЫЕ ПУТИ - УСПЕШНЫЙ ЗАПУСК!"
 */

import * as fs from "fs";
import * as path from "path";

export class ConfigLoader {
  // ПУТЬ ОТНОСИТЕЛЬНО ИСХОДНОГО КОДА (src/config/)
  private static readonly CONFIG_PATH = path.join(
    __dirname,
    "..",
    "..",
    "src",
    "config"
  );
  private static readonly AVAILABLE_PATH = path.join(
    this.CONFIG_PATH,
    "available"
  );
  private static readonly ENABLED_PATH = path.join(this.CONFIG_PATH, "enabled");

  /**
   * 🔍 ПОЛУЧАЕМ ВСЕ ВКЛЮЧЕННЫЕ БИРЖИ
   */
  static getEnabledExchanges(): string[] {
    console.log(`🔍 ИЩЕМ КОНФИГИ В: ${this.ENABLED_PATH}`);

    if (!fs.existsSync(this.ENABLED_PATH)) {
      console.log("❌ enabled/ - ПАПКА НЕ СУЩЕСТВУЕТ");
      return [];
    }

    const files = fs
      .readdirSync(this.ENABLED_PATH)
      .filter((file: string) => file.endsWith(".json"))
      .map((file: string) => file.replace(".json", ""));

    console.log(`📂 enabled/: ${files.length} СИМЛИНКОВ - ${files.join(", ")}`);
    return files;
  }

  /**
   * 📄 ЗАГРУЖАЕМ КОНФИГ БИРЖИ
   */
  static loadExchangeConfig(name: string): any {
    const symlinkPath = path.join(this.ENABLED_PATH, `${name}.json`);

    console.log(`🔍 ЗАГРУЖАЕМ КОНФИГ: ${symlinkPath}`);

    if (!fs.existsSync(symlinkPath)) {
      throw new Error(`❌ ${name} - НЕТ СИМЛИНКА В enabled/`);
    }

    try {
      const data = fs.readFileSync(symlinkPath, "utf8");
      const config = JSON.parse(data);
      console.log(`✅ ${config.name} - КОНФИГ ЗАГРУЖЕН`);
      return config;
    } catch (error) {
      throw new Error(`❌ ${name} - ОШИБКА ЧТЕНИЯ: ${error}`);
    }
  }
}
