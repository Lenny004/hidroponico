#!/usr/bin/env node
/**
 * Copia los hooks de .githooks a .git/hooks (sin tocar git config).
 */
import { chmodSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const gitDir = join(raiz, ".git");
const destino = join(gitDir, "hooks");
const origen = join(raiz, ".githooks");

if (!existsSync(gitDir)) {
  process.exit(0);
}

mkdirSync(destino, { recursive: true });

for (const nombre of ["prepare-commit-msg", "commit-msg"]) {
  const de = join(origen, nombre);
  const a = join(destino, nombre);
  if (!existsSync(de)) {
    continue;
  }
  copyFileSync(de, a);
  try {
    chmodSync(a, 0o755);
  } catch {
    // En Windows el bit ejecutable no siempre aplica; Git igual corre el hook.
  }
}
