import { JwksClient } from "./../../../src/client";
import * as express from "express";
import { Request, Response } from "express";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const app: express.Application = express();
const port = 3001;

const authClient = new JwksClient({
  jwksUri: "http://localhost:3000/jwks",
  secure: false,
});

app.use(express.urlencoded({ limit: "2mb", extended: true }));
app.get("/", (req: Request, res: Response) => {
  return res.send("Hello World");
});

app.get("/secret", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (token) {
    await authClient.verify(token);
    return res.send("This is a secret page");
  }
  return res.send(`You are not authorized to see the secret page`);
});

app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
