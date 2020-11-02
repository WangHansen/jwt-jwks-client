import debug from "debug";

export default class RateLimiter {
  private lastUpdateTime = new Date(Date.now() - 1000 * 60);
  private interval = 0;
  logger = debug("jwks");

  constructor(requestPerMin: number) {
    if (requestPerMin < 0) {
      throw new Error("Request per min must >= 0");
    } else if (requestPerMin > 0) {
      this.interval = 60000 / requestPerMin;
    }
    this.logger(`Cache interval is ${this.interval}ms`);
  }

  allow(dryRun = false): boolean {
    if (this.interval === 0) return true;
    if (new Date().getTime() - this.lastUpdateTime.getTime() > this.interval) {
      if (!dryRun) {
        this.lastUpdateTime = new Date();
      }
      return true;
    }
    return false;
  }
}
