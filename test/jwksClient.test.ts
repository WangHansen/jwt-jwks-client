import { JwksClient } from "../src/client";
import { JWT } from "jose";
import * as nock from "nock";

const privateKeys: any[] = [
  {
    crv: "P-256",
    x: "fNZ9zhq_qGKU0anydEyx9sDoTqeYlV6ICOStHEX4tnU",
    y: "3E91IisT1lTgxyOGYYXCLIk5MGKEkM0OFNhmjsyYzR8",
    d: "rqehipHR1G1Rec9-Z1gaqV0CvN6FlM_Ix5Gptpyk-zY",
    kty: "EC",
    kid: "4EB9pwg9UXJDXpCaxokuSLM0wnGj0gJNLP53JtWxJkc",
    use: "sig",
  },
  {
    crv: "P-256",
    x: "Gd1fiWMqcAHF0kFXBVfyNaGAstmQL24X5Vb7b6XwK8M",
    y: "qvE2VyyS7IrdROT4ZAkEM7TZYPwf0yafqm10JaOs8R8",
    d: "0CgwX5YNO1-_IeQG12zkAUdLnuyy7-Bk58c0ybi4rRA",
    kty: "EC",
    kid: "M1xNVbAu-X7_IUp131tPsdEUuFCCrrE_bZV4yB0dAoc",
    use: "sig",
  },
  {
    crv: "P-256",
    x: "YcNvOODSCte-ggb-CzjcCGBMc8gAZVxKEBbWKyo--iw",
    y: "NwEpcV9LfLeRts4TvINZgtkIYaP3P3UZlOvs8PQUEJg",
    d: "y0fm93rHKR0W2uWAEfobQeiw6nxIZLA6TLmFSi8-tJM",
    kty: "EC",
    kid: "Wn4ttcFZfX4nLFx-PAhtdJoLpkZDUxd1gkXe2t0IRYk",
    use: "sig",
  },
];

const newPrivateKeys = [
  ...privateKeys,
  {
    crv: "P-256",
    x: "pUMX_gxdCxZ1Ci1kTUqHxx5A8nlqwcB7g3rCo6yH_Tk",
    y: "4hLTgEOQUUpYgAE02PdNicz43pMBpghgFEHavwqjqHg",
    d: "OUeSAREuNHFRuhlXDGKOeCoGeSrmCcBZkjHMWVxdKtE",
    kty: "EC",
    kid: "e_XNpog3AmfSKqq1F6VaiALmlVhPtNG2upnHVYHttUw",
    use: "sig",
  },
].slice(1);

const publicKeys = [
  ...[...privateKeys].map((item) => {
    return {
      ...item,
      d: undefined,
    };
  }),
];

const newPublicKeys = [
  ...[...newPrivateKeys].map((item) => {
    return {
      ...item,
      d: undefined,
    };
  }),
];

describe("Jwks client tests", () => {
  const jwksHost = "http://my-auth-server";

  describe("constructor tests: ", () => {
    test("should not set request agentOptions by default", async () => {
      nock(jwksHost)
        .get("/jwks")
        .reply(200, function () {
          expect(this.req).not.toHaveProperty("agentOptions");
          return { keys: publicKeys };
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
      });

      await client.getKeys();
    });

    test("should set request agentOptions when provided", async () => {
      nock(jwksHost)
        .get("/jwks")
        .reply(200, function () {
          expect((this.req as any).options.agent.options).toBeDefined();
          expect((this.req as any).options.agent.options["ca"]).toEqual(
            "loadCA()"
          );
          return { keys: publicKeys };
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
        requestAgentOptions: {
          ca: "loadCA()",
        },
      });

      await client.getKeys();
    });

    test("should not send the extra headers when not provided", async () => {
      nock(jwksHost)
        .get("/jwks")
        .reply(200, function () {
          expect(this.req.headers).toBeDefined();
          expect(this.req.headers["user-agent"]).toBe("axios/0.21.0");
          expect(this.req.headers["accept"]).toBeDefined();
          expect(this.req.headers["host"]).toBeDefined();
          expect(Object.keys(this.req.headers).length).toBe(3);
          return { keys: publicKeys };
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
      });

      await client.getKeys();
    });

    test("should send extra header", async () => {
      nock(jwksHost)
        .get("/jwks")
        .reply(200, function () {
          expect(this.req.headers).toBeDefined();
          expect(this.req.headers["user-agent"]).toBe("My-bot");
          expect(Object.keys(this.req.headers).length).toBe(3);
          return { keys: publicKeys };
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
        requestHeaders: {
          "User-Agent": "My-bot",
        },
      });

      await client.getKeys();
    });
  });

  describe("getKeys tests: ", () => {
    test("server error should fail", async () => {
      nock(jwksHost).get("/jwks").reply(500, "Unknown Server Error");

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
      });

      try {
        await client.getKeys();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe("Unknown Server Error");
      }
    });

    test("server return empty keys should fail", async () => {
      nock(jwksHost).get("/jwks").reply(200, {
        keys: [],
      });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
      });

      try {
        await client.getKeys();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe(
          "The JWKS endpoint did not contain any keys"
        );
      }
    });

    test("server keys should be stored", async () => {
      nock(jwksHost).get("/jwks").reply(200, {
        keys: publicKeys,
      });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
      });

      try {
        await client.getKeys();
        const keystore = (client as any).keystore;
        expect(keystore.size).toBe(3);
        expect(keystore.toJWKS()).toEqual({ keys: publicKeys });
      } catch (error) {
        expect(error).toBeUndefined();
      }
    });
  });

  describe("maybeRefreshKeyStore tests: ", () => {
    test("should call getKeys when keystore is empty", async () => {
      nock(jwksHost).get("/jwks").reply(200, {
        keys: publicKeys,
      });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
      });
      await client.getKeys();
      const spy = jest.spyOn(client, "getKeys");
      const currentKeystore = (client as any).keystore;
      await client.maybeRefreshKeyStore(
        "4EB9pwg9UXJDXpCaxokuSLM0wnGj0gJNLP53JtWxJkc"
      );
      expect(spy).not.toHaveBeenCalled();
      expect((client as any).keystore).toEqual(currentKeystore);
    });

    test("should not call getKeys when kid is present", async () => {
      nock(jwksHost).get("/jwks").reply(200, {
        keys: publicKeys,
      });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
      });
      const spy = jest.spyOn(client, "getKeys");
      expect((client as any).keystore.size).toBe(0);
      await client.maybeRefreshKeyStore();
      expect(spy).toHaveBeenCalled();
      expect((client as any).keystore.size).toBe(3);
    });

    test("should call getKeys when kid cannot be found", async () => {
      nock(jwksHost)
        .get("/jwks")
        .reply(200, {
          keys: publicKeys,
        })
        .get("/jwks")
        .reply(200, {
          keys: newPublicKeys,
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
      });
      const spy = jest.spyOn(client, "getKeys");
      await client.getKeys();
      expect((client as any).keystore.toJWKS()).toEqual({ keys: publicKeys });
      await client.maybeRefreshKeyStore("non-existing");
      expect(spy).toHaveBeenCalled();
      expect((client as any).keystore.toJWKS()).toEqual({
        keys: newPublicKeys,
      });
    });
  });

  describe("verify tests: ", () => {
    test("should be able to verify JWT issued by server", async () => {
      const payload = { username: "admin" };
      const jwt = JWT.sign(payload, privateKeys[0]);
      nock(jwksHost).get("/jwks").reply(200, {
        keys: publicKeys,
      });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
      });
      try {
        const res = await client.verify(jwt);
        expect(res.username).toEqual(payload.username);
      } catch (error) {
        expect(error).toBeUndefined();
      }
    });

    test("should fetch new keys if rotation happens and pass verification", async () => {
      const payload = { username: "admin" };
      const veryOldJwt = JWT.sign(payload, privateKeys[0]);
      const oldJwt = JWT.sign(payload, privateKeys[1]);
      const newJwt = JWT.sign(payload, newPrivateKeys[2]);
      nock(jwksHost).get("/jwks").reply(200, {
        keys: publicKeys,
      });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/jwks`,
      });
      // make sure very old jwt works initially
      try {
        const res = await client.verify(veryOldJwt);
        expect(res.username).toEqual(payload.username);
      } catch (error) {
        expect(error).toBeUndefined();
      }

      // simulates the key rotation on server side
      nock(jwksHost).get("/jwks").twice().reply(200, {
        keys: newPublicKeys,
      });
      const spy = jest.spyOn(client, "getKeys");
      try {
        const res = await client.verify(newJwt);
        // because of key mismatch, should fetch from server again
        expect(spy).toHaveBeenCalled();
        expect(res.username).toEqual(payload.username);
      } catch (error) {
        expect(error).toBeUndefined();
      }
      // old jwt still work after key rotation
      try {
        const res = await client.verify(oldJwt);
        expect(res.username).toEqual(payload.username);
      } catch (error) {
        expect(error).toBeUndefined();
      }
      // very old jwt should no longer work
      try {
        await client.verify(veryOldJwt);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe("no matching key found in the KeyStore");
      }
    });
  });
});
