import path from "node:path";
import { mkdir } from "node:fs/promises";
import { initProject, normalizeName, primaryCheckout } from "../src/projects/index.js";

/** Explicit old-layout fixture for retained compatibility tests. New init defaults remain compact. */
export async function legacyInitProject(home: string, options: Parameters<typeof initProject>[1]) {
  const contextPath = options.contextPath ?? (options.repository ? path.join(await primaryCheckout(options.repository), ".deep-context") : path.join(home, normalizeName(options.name)));
  await mkdir(path.join(contextPath, "doc"), { recursive: true });
  return initProject(home, { ...options, contextPath });
}
