// src/config/index.ts
import exchangesConfig from "./exchanges.json";

export interface Subscription {
  channel: string;
  match: any;
  action: string;
}

export interface ConnectionConfig {
  pingIntervalMs: number;
  pingFormat: {
    request: any;
    response: any;
  };
  initialMessages?: any[];
  subscriptions?: Subscription[];
}

export interface ExchangeConfig {
  name: string;
  wsUrl: string;
  enabled: boolean;
  connection: ConnectionConfig; // 🎯 УНИФИЦИРОВАННАЯ СТРУКТУРА
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
