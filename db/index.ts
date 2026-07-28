import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type D1Env = {
  DB?: unknown;
};

export function getDb() {
  const runtimeEnv = globalThis as typeof globalThis & D1Env;

  if (!runtimeEnv.DB) {
    throw new Error(
      "D1 binding `DB` is unavailable. Configure the deployment database binding before using getDb()."
    );
  }

  return drizzle(runtimeEnv.DB as Parameters<typeof drizzle>[0], { schema });
}
