import * as restify from "restify";
import passport from "passport";
import { Router } from "restify-router";

import userRouter from "./api/routes/router";
import corsMiddleware from "restify-cors-middleware2";

// 서버 생성
const router = new Router();

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: [],
  allowHeaders: ["Authorization"],
  exposeHeaders: ["Authorization"],
});
var server = restify.createServer();
server.pre(cors.preflight);
server.use(cors.actual);

server.use(restify.plugins.bodyParser({ requestBodyOnGet: true }));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.urlEncodedBodyParser());

router.add("/api", userRouter);
router.applyRoutes(server);

passport.initialize();
server.listen(3000, function () {
  console.log("server on", server.url);
});
