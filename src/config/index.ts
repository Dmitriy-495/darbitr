// src/config/index.ts
import exchangesConfig from "./exchanges.json";

export interface ExchangeConfig {
  name: string;
  wsUrl: string;
  enabled: boolean;
  pingIntervalMs: number;
  pingFormat: {
    request: any;
    response: any;
  };
}

export class ConfigLoader {
  static getExchangeConfig(exchangeId: string): ExchangeConfig | null {
    return (exchangesConfig as any)[exchangeId] || null;
  }

  static getEnabledExchanges(): string[] {
    const configs = exchangesConfig as Record<string, ExchangeConfig>;
    return Object.keys(configs).filter((id) => configs[id].enabled);
  }
}
