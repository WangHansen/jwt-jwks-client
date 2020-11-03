[![Build Status](https://travis-ci.org/WangHansen/jwt-jwks-client.svg?branch=master)](https://travis-ci.org/WangHansen/jwt-jwks-client)
[![codecov](https://codecov.io/gh/WangHansen/jwt-jwks-client/branch/master/graph/badge.svg?token=68TH4RQWM2)](https://codecov.io/gh/WangHansen/jwt-jwks-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FWangHansen%2Fjwt-jwks-client.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FWangHansen%2Fjwt-jwks-client?ref=badge_shield)

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <!-- <a href="https://github.com/WangHansen/jwt-jwks-client">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a> -->

  <h3 align="center">JWT JWKS Client</h3>

  <p align="center">
    A client library that verifies a JWT token by retrieve signing keys from a JWKS (JSON Web Key Set) endpoint written in TypeScript.
  </p>
</p>

## Usage

You'll provide the client with the JWKS endpoint which exposes your signing keys. Using the `verify` you can if a JWT token.

```javascript
import jwksClient from "jwt-jwks-client";
// or using require
const jwksClient = require('jwt-jwks-client');

const client = jwksClient({
  secure: true, // Default value
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
  rateLimit: 0; // Optional, num of request per min, 0 means no limit
  requestHeaders: {}, // Optional
  requestAgentOptions: {}, // Optional
  timeout: 30000, // Optional, default 30s
});

// throws error if token not valid
await client.verify(jwtToken);
```

### Verify with options

```ts
await client.verify(jwtToken, verifyOptions);

interface VerifyOptions {
  iat?: boolean;
  kid?: boolean;
  subject?: string;
  issuer?: string;
  audience?: string | string[];
  header?: object;
  algorithm?: string;
  expiresIn?: string;
  notBefore?: string;
  jti?: string;
  now?: Date;
}
```
For details, see [jose](https://github.com/panva/jose/blob/master/docs/README.md#jwtverifytoken-keyorstore-options) library

### Using AgentOptions for TLS/SSL Configuration

The `requestAgentOptions` property can be used to configure SSL/TLS options. An
example use case is providing a trusted private (i.e. enterprise/corporate) root
certificate authority to establish TLS communication with the `jwks_uri`.

```js
import jwksClient from "jwt-jwks-client";

const client = jwksClient({
  strictSsl: true, // Default value
  jwksUri: 'https://my-enterprise-id-provider/.well-known/jwks.json',
  requestHeaders: {}, // Optional
  requestAgentOptions: {
    ca: fs.readFileSync(caFile)
  }
});
```

For more information, see [the NodeJS request library `agentOptions`
documentation](https://github.com/request/request#using-optionsagentoptions).

## Showing Trace Logs

To show trace logs you can set the following environment variable:

```
DEBUG=jwks
```

## JWT token sign

Check out my other [JWT Auth library](https://github.com/WangHansen/jwt-auth) that supports not only regular JWT token generation, but also __key rotation__ and __key revocation__.


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FWangHansen%2Fjwt-jwks-client.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FWangHansen%2Fjwt-jwks-client?ref=badge_large)