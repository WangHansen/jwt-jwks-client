export default class JwksRateLimitError extends Error {
  code: string;
  constructor(message?: string) {
    super(message);
    this.message = message ?? "Too many requests";
    this.name = this.constructor.name;
    this.code = "ERR_RATE_LIMIT_EXCEED";
    Error.captureStackTrace(this, this.constructor);
  }
}
