// src/utils/Common.ts (упрощенная версия)
export class Logger {
  static info(message: string): void {
    console.log(`📌 ${message}`);
  }

  static success(message: string): void {
    console.log(`✅ ${message}`);
  }

  static error(message: string): void {
    console.error(`❌ ${message}`);
  }

  static warning(message: string): void {
    console.warn(`⚠️ ${message}`);
  }
}
