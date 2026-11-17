import { createServer } from "node:http";
import { spaces } from "../lib/data.ts";

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const path = url.pathname;
  const params = url.searchParams;
  const filtered = spaces.filter(
    (space) =>
      (!params.get("search") ||
        [space.name, space.description, space.location].some((value) =>
          value.includes(params.get("search")),
        )) &&
      (!params.get("type") || space.type === params.get("type")) &&
      space.capacity >= Number(params.get("minCapacity") || 0),
  );
  if (params.get("ordering") === "price")
    filtered.sort((a, b) => a.price - b.price);
  if (params.get("ordering") === "-price")
    filtered.sort((a, b) => b.price - a.price);
  const space = spaces.find(({ id }) => path === `/api/v1/spaces/${id}/`);
  const data = path === "/api/v1/spaces/" ? filtered : space;
  response.writeHead(data ? 200 : 404, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data ?? { code: "not_found" }));
}).listen(3011, "127.0.0.1");
