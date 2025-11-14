// src/exchanges/ExchangeFactory.ts
import { BaseExchange } from "./BaseExchange";
import { ConfigLoader } from "../config";
import { Logger } from "../utils/Common";

export class ExchangeFactory {
  static createExchanges(): BaseExchange[] {
    const enabledExchanges = ConfigLoader.getEnabledExchanges();
    Logger.info(`🎯 Активные биржи: ${enabledExchanges.join(", ")}`);

    return enabledExchanges
      .map((exchangeId) => {
        const config = ConfigLoader.getExchangeConfig(exchangeId);
        return config
          ? new BaseExchange(
              config.name,
              config.wsUrl,
              config.connection // 🎯 ВСЯ КОНФИГУРАЦИЯ В ОДНОМ ОБЪЕКТЕ
            )
          : null;
      })
      .filter(Boolean) as BaseExchange[];
  }
}
