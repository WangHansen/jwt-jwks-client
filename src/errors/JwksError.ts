export default class JwksError extends Error {
  code: string;
  constructor(message?: string) {
    super(message);
    this.message = message ?? "Failed to get JWKS from server";
    this.name = this.constructor.name;
    this.code = "ERR_SYNC_FAILURE";
    Error.captureStackTrace(this, this.constructor);
  }
}
