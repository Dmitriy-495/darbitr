/**
 * @file src/utils/LatencyQueue.ts
 * @path ./src/utils/LatencyQueue.ts
 * @brief Очередь для хранения и расчета задержек
 * @version 3.0.0
 */

export class LatencyQueue {
  private queue: number[] = [];
  private maxSize: number;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
  }

  public add(latency: number): void {
    this.queue.push(latency);
    if (this.queue.length > this.maxSize) {
      this.queue.shift();
    }
  }

  public getAverage(): number {
    if (this.queue.length === 0) return 0;
    const sum = this.queue.reduce((a, b) => a + b, 0);
    return sum / this.queue.length;
  }

  public getSize(): number {
    return this.queue.length;
  }

  public clear(): void {
    this.queue = [];
  }

  public getValues(): number[] {
    return [...this.queue];
  }
}
