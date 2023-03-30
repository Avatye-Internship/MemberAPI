import * as restify from "restify";
import { router } from "./api/routes/router";

// 서버 생성

var server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());
server.use;
server.use("/api", router);
server.listen(3000, function () {
  console.log("server on", server.url);
});
