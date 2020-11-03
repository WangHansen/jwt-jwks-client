import * as express from "express";
import { Request, Response } from "express";
import JwtAuth from "@hansenw/jwt-auth";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const app: express.Application = express();
const port = 3000;

const authService = new JwtAuth();

app.use(express.urlencoded({ limit: "2mb", extended: true }));
app.get("/", (req: Request, res: Response) => {
  return res.send("Hello World");
});

app.post("/login", (req: Request, res: Response) => {
  if (req.body.username === "admin" && req.body.password === "password") {
    const token = authService.sign({ userId: "admin" });
    return (
      res
        .set("authorization", token)
        // This setup is for testing purpose
        .send(`${token}`)
    );
  }
  res.status(401).send("Not authorized");
});

app.get("/jwks", (req: Request, res: Response) => {
  res.json(authService.JWKS(true));
});

app.get("/secret", (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (token && authService.verify(token)) {
    return res.send("This is a secret page");
  }
  return res.send(`You are not authorized to see the secret page`);
});

app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
