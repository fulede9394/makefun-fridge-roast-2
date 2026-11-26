// Roast the Smart Fridge — one-line entry for make.fun.
// The program writes a single roast line to <output dir>/entry.txt.
// Gate: the file must be UTF-8 text of 1 to 160 characters, not only whitespace.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Every tunable lives here so the roast itself stays a plain data value.
const CONFIG = Object.freeze({
  // Where the grader looks for the entry (overridden by MAKEFUN_OUTPUT_DIR).
  fallbackDir: "/output",
  // The sealed gate: 1..160 characters, not only whitespace.
  minChars: 1,
  maxChars: 160,
  fileName: "entry.txt",
  encoding: "utf8" as const,
});

// The roast: one line about the smart fridge we actually live with.
const ROAST_LINES = Object.freeze([
  "My smart fridge has Wi-Fi, a camera and a touchscreen — and the most useful thing it does is beep when I leave the door open at 2 a.m. deciding what to eat.",
]);

// Pick the output directory: the harness env var wins, /output is the fallback.
function resolveOutputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return fromEnv !== undefined && fromEnv.trim() !== ""
    ? fromEnv
    : CONFIG.fallbackDir;
}

// Collapse stray whitespace so the line is exactly one line, no padding.
function normaliseRoast(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

// Guard the gate before anything is written: length and non-blank.
function validateRoast(text: string): void {
  if (text.length < CONFIG.minChars) {
    throw new Error(`roast is empty (needs at least ${CONFIG.minChars} char)`);
  }
  if (text.length > CONFIG.maxChars) {
    throw new Error(
      `roast is ${text.length} chars, over the ${CONFIG.maxChars} cap`,
    );
  }
  if (text.trim() === "") {
    throw new Error("roast is only whitespace");
  }
  // The judge wants one line: a newline inside the text would break it.
  if (text.includes("\n")) {
    throw new Error("roast must be a single line");
  }
}

// Write the validated line and report where it landed.
async function publishRoast(text: string, outDir: string): Promise<string> {
  await mkdir(outDir, { recursive: true });
  const target = join(outDir, CONFIG.fileName);
  await writeFile(target, text + "\n", CONFIG.encoding);
  return target;
}

async function main(): Promise<void> {
  const roast = normaliseRoast(ROAST_LINES[0]);
  validateRoast(roast);
  const target = await publishRoast(roast, resolveOutputDir());
  console.log(`wrote ${roast.length} chars to ${target}`);
}

await main();
