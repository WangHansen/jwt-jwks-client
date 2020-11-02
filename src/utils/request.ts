import * as http from "http";
import * as https from "https";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

interface RequestOptions {
  uri: string;
  https?: boolean;
  headers?: Record<string, string>;
  agentOptions?: Record<string, string>;
  timeout?: number;
}

export default async function (
  options: RequestOptions
): Promise<AxiosResponse<any>> {
  const requestOptions: AxiosRequestConfig = {
    url: options.uri,
    headers: options.headers,
    timeout: options.timeout,
  };

  if (options.agentOptions || options.https !== undefined) {
    const agentOptions = {
      ...(options.https !== undefined && {
        rejectUnauthorized: options.https,
      }),
      ...(options.headers && { headers: options.headers }),
      ...options.agentOptions,
    };

    requestOptions.httpAgent = new http.Agent(
      agentOptions as http.AgentOptions
    );
    requestOptions.httpsAgent = new https.Agent(agentOptions);
  }

  return await axios.request(requestOptions);
}
