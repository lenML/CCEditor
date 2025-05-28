import fs from "fs";
import path from "path";

const specFile = "./scripts/spec.md";
const outputFile = "./scripts/spec.i18n.json";

function parseSpecMarkdown(content: string): Record<string, string[]> {
  const lines = content.split("\n");

  const result: Record<string, string[]> = {};
  let currentKey: string | null = null;
  let currentValue: string[] = [];

  for (const line of lines) {
    const match = line.match(/^### [`‘“]?([\w\-]+)[`’”]?\s*$/);
    if (match) {
      if (currentKey) {
        result[currentKey] = currentValue
          .join("\n")
          .trim()
          .split(/\n\s*\n/)
          .map((p) => p.trim());
      }
      currentKey = match[1];
      currentValue = [];
    } else if (currentKey) {
      currentValue.push(line);
    }
  }

  if (currentKey) {
    result[currentKey] = currentValue
      .join("\n")
      .trim()
      .split(/\n\s*\n/)
      .map((p) => p.trim());
  }

  return result;
}

function main() {
  const content = fs.readFileSync(path.join(process.cwd(), specFile), "utf-8");
  const parsed = parseSpecMarkdown(content);
  for (const [k, v] of Object.entries(parsed)) {
    parsed[`help-${k}`] = v;
    delete parsed[k];
  }
  fs.writeFileSync(outputFile, JSON.stringify(parsed, null, 2), "utf-8");
  console.log(`✅ JSON saved to ${outputFile}`);
}

main();
