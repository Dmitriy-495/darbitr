// src/config/ConfigLoader.ts

/**
 * ⚡ ЗАГРУЗЧИК КОНФИГОВ - ЧТЕНИЕ ПРИ ЗАПУСКЕ
 */

import * as fs from "fs";
import * as path from "path";

export class ConfigLoader {
  private static readonly CONFIG_PATH = path.join(
    __dirname,
    "..",
    "..",
    "src",
    "config"
  );
  private static readonly ENABLED_PATH = path.join(this.CONFIG_PATH, "enabled");

  static getEnabledExchanges(): string[] {
    if (!fs.existsSync(this.ENABLED_PATH)) return [];
    return fs
      .readdirSync(this.ENABLED_PATH)
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(".json", ""));
  }

  static loadExchangeConfig(name: string): any {
    const file = path.join(this.ENABLED_PATH, `${name}.json`);
    if (!fs.existsSync(file)) throw new Error(`❌ ${name} - НЕТ КОНФИГА`);

    const data = fs.readFileSync(file, "utf8");
    const config = JSON.parse(data);
    console.log(`📄 ${config.name} - ЗАГРУЖЕН`);
    return config;
  }
}
