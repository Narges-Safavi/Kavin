import { createServer } from "node:http";
import { spaces } from "../lib/data.ts";

createServer((request, response) => {
  const path = new URL(request.url ?? "/", "http://localhost").pathname;
  const space = spaces.find(({ id }) => path === `/api/v1/spaces/${id}/`);
  const data = path === "/api/v1/spaces/" ? spaces : space;
  response.writeHead(data ? 200 : 404, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data ?? { code: "not_found" }));
}).listen(3011, "127.0.0.1");
