import debug from "debug";
import { JWKS, JWT } from "jose";
import { AxiosResponse } from "axios";
import request from "./utils/request";
import RateLimiter from "./utils/rateLimit";
import JwksError from "./errors/JwksError";

export interface ClientOptions {
  jwksUri: string;
  rateLimit?: number; // num of request per min
  secure?: boolean;
  requestHeaders?: Record<string, string>;
  requestAgentOptions?: Record<string, string>;
  timeout?: number;
}

export class JwksClient {
  private logger = debug("jwks");
  private keystore = new JWKS.KeyStore();
  private limiter: RateLimiter;

  constructor(private options: ClientOptions) {
    this.options = {
      rateLimit: 0,
      timeout: 30000,
      ...options,
    };
    this.limiter = new RateLimiter(this.options.rateLimit ?? 0);
  }
  /**
   * Fetch keys info from remote uri that follows jwks standard
   * @returns Promise
   */
  async getKeys(): Promise<void> {
    this.logger(`Fetching keys from '${this.options.jwksUri}'`);
    let res: AxiosResponse<{ keys: [any] }>;
    try {
      res = await request({
        uri: this.options.jwksUri,
        https: this.options.secure,
        headers: this.options.requestHeaders,
        agentOptions: this.options.requestAgentOptions,
        timeout: this.options.timeout,
      });
    } catch (error) {
      const { response } = error;
      this.logger("Failed to get keys:", (response && response.data) || error);
      if (response) {
        const { data, statusText, status } = response;
        throw new JwksError(data || statusText || `Http Error ${status}`);
      }
      throw error;
    }

    if (!res.data.keys || !res.data.keys.length) {
      throw new JwksError("The JWKS endpoint did not contain any keys");
    }

    this.keystore = JWKS.asKeyStore(res.data);
  }

  async maybeRefreshKeyStore(kid?: string): Promise<void> {
    if (!this.keystore.size || (kid && !this.keystore.get({ kid }))) {
      if (this.limiter.allow()) {
        await this.getKeys();
      }
    }
  }

  /**
   * Verify a JWT token with current keystore
   * @param {string} token
   * @param {JWT.VerifyOptions} options
   */
  async verify(
    token: string,
    options?: JWT.VerifyOptions
  ): Promise<Record<string, unknown>> | never {
    options = options || {};
    const { header } = JWT.decode(token, { complete: true });
    await this.maybeRefreshKeyStore((header as any).kid);
    const payload = JWT.verify(token, this.keystore, options) as Record<
      string,
      unknown
    >;
    return payload;
  }
}
