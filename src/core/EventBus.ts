/**
 * @file src/core/EventBus.ts
 * @path ./src/core/EventBus.ts
 * @brief Система событий с приоритетами
 * @version 3.0.0
 *
 * ОСНОВНАЯ ФУНКЦИЯ: Высокоскоростная коммуникация между модулями
 */

/**
 * Приоритеты событий
 */
export enum EventPriority {
  HIGH = "HIGH", // Критичные события (выполняются немедленно)
  NORMAL = "NORMAL", // Обычные события
  LOW = "LOW", // Фоновые события (выполняются когда есть время)
}

/**
 * Типы событий
 */
export enum EventType {
  // Данные бирж (ВЫСОКИЙ приоритет)
  ORDERBOOK_UPDATE = "ORDERBOOK_UPDATE",
  ARBITRAGE_SIGNAL = "ARBITRAGE_SIGNAL",
  EXECUTION_ORDER = "EXECUTION_ORDER",

  // Системные (НИЗКИЙ приоритет)
  LOG_DEBUG = "LOG_DEBUG",
  STATISTICS_UPDATE = "STATISTICS_UPDATE",
}

/**
 * Обработчик события
 */
type EventHandler = (data: any) => void;

/**
 * Шина событий с приоритетами
 */
export class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map();
  private highPriorityQueue: Array<{ type: EventType; data: any }> = [];
  private lowPriorityQueue: Array<{ type: EventType; data: any }> = [];

  /**
   * Подписывается на событие
   */
  public subscribe(eventType: EventType, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * Публикует событие с приоритетом
   */
  public publish(
    eventType: EventType,
    data: any,
    priority: EventPriority = EventPriority.NORMAL
  ): void {
    const event = { type: eventType, data };

    switch (priority) {
      case EventPriority.HIGH:
        // ВЫСОКИЙ приоритет - выполняем немедленно
        this.executeHandlers(event);
        break;

      case EventPriority.NORMAL:
        // ОБЫЧНЫЙ приоритет - добавляем в очередь
        this.highPriorityQueue.push(event);
        break;

      case EventPriority.LOW:
        // НИЗКИЙ приоритет - добавляем в фоновую очередь
        this.lowPriorityQueue.push(event);
        break;
    }
  }

  /**
   * Обрабатывает очереди событий (вызывается в основном цикле)
   */
  public processQueues(): void {
    // Сначала HIGH PRIORITY очередь
    while (this.highPriorityQueue.length > 0) {
      const event = this.highPriorityQueue.shift()!;
      this.executeHandlers(event);
    }

    // Потом LOW PRIORITY очередь (если есть время)
    if (this.lowPriorityQueue.length > 0) {
      const event = this.lowPriorityQueue.shift()!;
      this.executeHandlers(event);
    }
  }

  /**
   * Выполняет обработчики события
   */
  private executeHandlers(event: { type: EventType; data: any }): void {
    const handlers = this.handlers.get(event.type) || [];
    handlers.forEach((handler) => {
      try {
        handler(event.data);
      } catch (error) {
        console.error(`💥 EventBus ошибка в обработчике ${event.type}:`, error);
      }
    });
  }
}

// Глобальный экземпляр EventBus
export const globalEventBus = new EventBus();
