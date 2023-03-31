import * as restify from "restify";
import passport from "passport";
import { router } from "./api/routes/router";
import { Router } from "restify-router";

// 서버 생성

var server = restify.createServer();
router.applyRoutes(server);
server.use(restify.plugins.conditionalRequest);
server.use(restify.plugins.bodyParser({ requestBodyOnGet: true }));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.urlEncodedBodyParser());
passport.initialize();
server.listen(3000, function () {
  console.log("server on", server.url);
});
