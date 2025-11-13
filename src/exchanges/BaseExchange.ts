import { LatencyQueue } from "../utils/LatencyQueue";

export abstract class BaseExchange {
  protected ws: WebSocket | null = null;
  protected pingTime: number = 0;
  private latencyQueue: LatencyQueue = new LatencyQueue(10);
  private isTestingPing: boolean = false;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(protected name: string, protected wsUrl: string) {}

  public connect(): void {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      console.log(`✅ ${this.name}: подключено`);
      this.startPingTest();
    };

    this.ws.onerror = (error) => {
      console.log(`💥 ${this.name}: ошибка подключения`);
    };

    this.ws.onclose = () => {
      console.log(`🔌 ${this.name}: отключено`);
    };

    this.ws.onmessage = (event) => {
      this.handleRawMessage(event.data);
    };
  }

  public disconnect(): void {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.ws) this.ws.close();
  }

  protected send(data: any): void {
    this.ws?.send(JSON.stringify(data));
  }

  private handleRawMessage(data: any): void {
    try {
      const msg = JSON.parse(data);
      if (this.isPongMessage(msg)) this.handlePong();
    } catch (error) {}
  }

  private startPingTest(): void {
    this.isTestingPing = true;
    this.latencyQueue.clear();
    let testCount = 0;

    const testInterval = setInterval(() => {
      if (testCount >= 10) {
        clearInterval(testInterval);
        this.isTestingPing = false;
        console.log(
          `📊 ${this.name}: средняя задержка ${this.latencyQueue
            .getAverage()
            .toFixed(1)}ms`
        );
        this.pingInterval = setInterval(() => this.sendPing(), 30000);
        this.onReady();
        return;
      }
      this.sendPing();
      testCount++;
    }, 1000);
  }

  protected handlePong(): void {
    const latency = Date.now() - this.pingTime;
    this.latencyQueue.add(latency);
    const avg = this.latencyQueue.getAverage();
    console.log(
      `${this.name} ping: ${new Date(
        this.pingTime
      ).toISOString()} pong: ${new Date().toISOString()} PONG: ${avg.toFixed(
        1
      )}ms`
    );
  }

  protected abstract onReady(): void;
  protected abstract isPongMessage(msg: any): boolean;
  protected abstract sendPing(): void;
}
