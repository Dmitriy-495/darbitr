// src/utils/MessageUtils.ts
export class MessageUtils {
  // 🔍 ПРОСТАЯ ПРОВЕРКА СОВПАДЕНИЯ
  static matchesPattern(message: any, pattern: any): boolean {
    if (typeof pattern === "string") {
      return message === pattern;
    }

    if (typeof pattern === "object") {
      for (const [key, value] of Object.entries(pattern)) {
        if (message[key] !== value) return false;
      }
      return true;
    }

    return false;
  }

  // 📤 ФОРМАТИРОВАНИЕ PING ЗАПРОСА
  static formatPingRequest(pingFormat: any): any {
    if (typeof pingFormat.request === "string") {
      return pingFormat.request;
    }

    const request = { ...pingFormat.request };

    if (request.time === "timestamp") {
      request.time = Math.floor(Date.now() / 1000);
    }
    if (request.id === "timestamp") {
      request.id = Date.now().toString();
    }

    return request;
  }
}
