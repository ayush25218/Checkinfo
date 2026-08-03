process.env.HOSTNAME = "0.0.0.0";
process.env.NODE_ENV = "production";

import("./server.js").catch((error) => {
  console.error(error);
  process.exit(1);
});
