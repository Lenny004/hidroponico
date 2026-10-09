import { execFileSync } from "node:child_process";

execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "inherit" });
console.log("Hooks de Git configurados en .githooks");
