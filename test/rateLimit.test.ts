import RateLimiter from "../src/utils/rateLimit";

const fakeAPICall = () => new Promise((resolve) => setTimeout(resolve, 500));

describe("rate limiter tests: ", () => {
  describe("constructor test", () => {
    test("negative number should fail", () => {
      expect(() => new RateLimiter(-1)).toThrowError();
    });

    test("0 should set interval to 0", () => {
      const limiter = new RateLimiter(0) as any;
      expect(limiter.interval).toBe(0);
    });

    test("positive number should correctly set interval", () => {
      for (let i = 0; i < 5; i++) {
        const num = Math.round(Math.random() * 9 + 1);
        const limiter = new RateLimiter(num) as any;
        expect(limiter.interval).toBe(60000 / num);
      }
    });
  });

  describe("allow test", () => {
    test("allow should pass if interval is 0", () => {
      const limiter = new RateLimiter(0);
      for (let i = 0; i < 5; i++) {
        expect(limiter.allow()).toBe(true);
      }
    });

    test("allow should fail if ask again within interval", () => {
      const limiter = new RateLimiter(10);
      const now = new Date();
      expect(limiter.allow()).toBe(true);
      for (let i = 0; i < 5; i++) {
        expect(limiter.allow()).toBe(false);
      }
      expect((limiter as any).lastUpdateTime.getTime()).toBeGreaterThanOrEqual(
        now.getTime()
      );
    });

    test("dry run should behave the same", () => {
      const limiter = new RateLimiter(10);
      const now = new Date();
      expect(limiter.allow()).toBe(true);
      for (let i = 0; i < 5; i++) {
        expect(limiter.allow(true)).toBe(false);
      }
      expect((limiter as any).lastUpdateTime.getTime()).toBeGreaterThanOrEqual(
        now.getTime()
      );
    });
  });
});
