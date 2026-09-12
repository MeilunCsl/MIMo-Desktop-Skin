#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const CONTAINER_AT_RULES = /^@(media|supports|layer|container|scope|document)\b/i;

const sourcePath = path.resolve(
  process.argv.find((value) => value.startsWith("--source="))?.slice(9) ||
    path.join(import.meta.dirname, "..", "..", "assets", "dream-skin.css"),
);
const outputPath = path.resolve(
  process.argv.find((value) => value.startsWith("--output="))?.slice(9) || sourcePath,
);
const checkOnly = process.argv.includes("--check");

function scanDelimiter(text, start, delimiters) {
  let quote = "";
  let comment = false;
  let paren = 0;
  let bracket = 0;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (comment) {
      if (char === "*" && next === "/") {
        comment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "*") {
      comment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "(") paren += 1;
    else if (char === ")") paren = Math.max(0, paren - 1);
    else if (char === "[") bracket += 1;
    else if (char === "]") bracket = Math.max(0, bracket - 1);
    else if (paren === 0 && bracket === 0 && delimiters.has(char)) return index;
  }
  return text.length;
}

function matchingBrace(text, open) {
  let depth = 1;
  let quote = "";
  let comment = false;
  for (let index = open + 1; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (comment) {
      if (char === "*" && next === "/") {
        comment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "*") {
      comment = true;
      index += 1;
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "{") depth += 1;
    else if (char === "}" && --depth === 0) return index;
  }
  throw new Error(`Unclosed CSS block at offset ${open}`);
}

function parseDeclarations(body) {
  const declarations = [];
  let start = 0;
  while (start < body.length) {
    const end = scanDelimiter(body, start, new Set([";"]));
    const raw = body.slice(start, end < body.length ? end + 1 : end);
    const clean = raw.replace(/\/\*[\s\S]*?\*\//g, "").trim().replace(/;$/, "");
    const colon = scanDelimiter(clean, 0, new Set([":"]));
    const property = colon < clean.length ? clean.slice(0, colon).trim().toLowerCase() : "";
    declarations.push({
      raw,
      property: /^--[\w-]+$|^-?[a-z][\w-]*$/i.test(property) ? property : "",
      important: /!important\s*$/i.test(clean),
      removed: false,
    });
    start = end + 1;
  }
  return declarations;
}

function parseBlock(text, start = 0, end = text.length) {
  const nodes = [];
  let cursor = start;
  while (cursor < end) {
    const delimiter = scanDelimiter(text, cursor, new Set(["{", ";", "}"]));
    if (delimiter >= end) {
      nodes.push({ type: "raw", raw: text.slice(cursor, end) });
      break;
    }
    const token = text[delimiter];
    if (token === "}") {
      nodes.push({ type: "raw", raw: text.slice(cursor, delimiter) });
      break;
    }
    const preludeRaw = text.slice(cursor, delimiter);
    const prelude = preludeRaw.trim();
    if (token === ";") {
      nodes.push({ type: "raw", raw: `${preludeRaw};` });
      cursor = delimiter + 1;
      continue;
    }
    const close = matchingBrace(text, delimiter);
    const body = text.slice(delimiter + 1, close);
    const leadingMatch = preludeRaw.match(/^\s*(?:\/\*[\s\S]*?\*\/\s*)*/);
    const leading = leadingMatch?.[0] || "";
    const header = preludeRaw.slice(leading.length).trim();
    if (!header) {
      nodes.push({ type: "raw", raw: text.slice(cursor, close + 1) });
    } else if (CONTAINER_AT_RULES.test(header)) {
      nodes.push({
        type: "container",
        leading,
        header,
        children: parseBlock(body),
        start: cursor,
      });
    } else if (header.startsWith("@")) {
      nodes.push({ type: "raw", raw: text.slice(cursor, close + 1) });
    } else {
      nodes.push({
        type: "style",
        leading,
        selectors: header,
        declarations: parseDeclarations(body),
        start: cursor,
        removed: false,
      });
    }
    cursor = close + 1;
  }
  return nodes;
}

const source = fs.readFileSync(sourcePath, "utf8");
const root = parseBlock(source);
const stats = {
  relationalRulesRemoved: 0,
  duplicateDeclarationsRemoved: 0,
  emptyRulesRemoved: 0,
};

function normalizeTree(nodes) {
  for (const node of nodes) {
    if (node.type === "container") {
      normalizeTree(node.children);
      continue;
    }
    if (node.type !== "style") continue;
    // Relational selectors are supported by current Chromium and carry live
    // state (for example the earning-mode ring). Removal is migration-only.
    if (process.argv.includes("--drop-relational") && node.selectors.includes(":has(")) {
      node.removed = true;
      stats.relationalRulesRemoved += 1;
      continue;
    }
  }
}

function compactSiblingDuplicates(nodes) {
  for (const node of nodes) {
    if (node.type === "container") compactSiblingDuplicates(node.children);
  }
  const groups = new Map();
  for (const node of nodes) {
    if (node.type !== "style" || node.removed) continue;
    const key = node.selectors.replace(/\s+/g, " ").trim();
    const group = groups.get(key) || [];
    group.push(node);
    groups.set(key, group);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const later = new Map();
    for (let index = group.length - 1; index >= 0; index -= 1) {
      for (const declaration of group[index].declarations) {
        if (!declaration.property) continue;
        const laterPriority = later.get(declaration.property);
        const shadowed = laterPriority === "important" ||
          (laterPriority !== undefined && !declaration.important);
        if (shadowed) {
          declaration.removed = true;
          stats.duplicateDeclarationsRemoved += 1;
        } else {
          later.set(declaration.property, declaration.important ? "important" : "normal");
        }
      }
      if (!group[index].declarations.some((item) => item.property && !item.removed)) {
        group[index].removed = true;
        stats.emptyRulesRemoved += 1;
      }
    }
  }
}

function render(nodes) {
  let result = "";
  const whitespaceOnly = (value) => value.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const node of nodes) {
    if (node.type === "raw") result += node.raw;
    else if (node.type === "container") {
      const body = render(node.children);
      if (body.trim()) result += `${node.leading}${node.header} {${body}}`;
      else result += whitespaceOnly(node.leading);
    } else if (!node.removed) {
      const body = node.declarations.filter((item) => !item.removed).map((item) => item.raw).join("");
      if (body.trim()) result += `${node.leading}${node.selectors} {${body}}`;
      else result += whitespaceOnly(node.leading);
    } else {
      result += whitespaceOnly(node.leading);
    }
  }
  return result;
}

normalizeTree(root);
compactSiblingDuplicates(root);
const output = render(root).replace(/\n{4,}/g, "\n\n\n").trimEnd() + "\n";
const report = {
  source: sourcePath,
  output: outputPath,
  checkOnly,
  beforeBytes: Buffer.byteLength(source),
  afterBytes: Buffer.byteLength(output),
  changed: output !== source,
  ...stats,
};
if (!checkOnly) fs.writeFileSync(outputPath, output, "utf8");
console.log(JSON.stringify(report, null, 2));
if (checkOnly && output !== source) process.exitCode = 2;
