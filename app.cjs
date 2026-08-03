const http = require("http");

const port = Number.parseInt(process.env.PORT || "3000", 10);

http
  .createServer((request, response) => {
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end(`beta passenger ok\nnode=${process.version}\nurl=${request.url}\n`);
  })
  .listen(port, "0.0.0.0");
