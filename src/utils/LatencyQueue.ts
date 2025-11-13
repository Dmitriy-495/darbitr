// src/utils/LatencyQueue.ts
export class LatencyQueue {
  private queue: number[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
  }

  addLatency(latency: number): void {
    this.queue.push(latency);

    // 🔄 УДАЛЯЕМ СТАРЫЕ ЗНАЧЕНИЯ ДЛЯ МИНИМИЗАЦИИ ПАМЯТИ
    if (this.queue.length > this.maxSize) {
      this.queue.shift();
    }
  }

  getAverage(): number {
    if (this.queue.length === 0) return 0;

    const sum = this.queue.reduce((acc, latency) => acc + latency, 0);
    return Number((sum / this.queue.length).toFixed(1));
  }

  getLast(): number {
    return this.queue[this.queue.length - 1] || 0;
  }

  getCount(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}
