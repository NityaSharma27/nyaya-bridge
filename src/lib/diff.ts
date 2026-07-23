export type DiffOp = {
  type: "equal" | "delete" | "insert";
  text: string;
};

function tokenizeWords(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? [];
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function segmentize(text: string): string[] {
  const segments: string[] = [];
  const delimiter = /;|\.(?=\s|$)|:(?=\s)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = delimiter.exec(text)) !== null) {
    let end = m.index + m[0].length;
    while (end < text.length && /\s/.test(text[end])) end++;
    segments.push(text.slice(lastIndex, end));
    lastIndex = end;
  }
  if (lastIndex < text.length) segments.push(text.slice(lastIndex));
  return segments;
}

function lcsDiff<T>(a: T[], b: T[]): { type: "equal" | "delete" | "insert"; item: T }[] {
  const n = a.length;
  const m = b.length;
  const dp: Uint32Array[] = new Array(n + 1);
  for (let i = 0; i <= n; i++) dp[i] = new Uint32Array(m + 1);

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const ops: { type: "equal" | "delete" | "insert"; item: T }[] = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.push({ type: "equal", item: a[i - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: "delete", item: a[i - 1] });
      i--;
    } else {
      ops.push({ type: "insert", item: b[j - 1] });
      j--;
    }
  }
  while (i > 0) ops.push({ type: "delete", item: a[i - 1] }), i--;
  while (j > 0) ops.push({ type: "insert", item: b[j - 1] }), j--;
  ops.reverse();
  return ops;
}

function wordLevelDiff(oldText: string, newText: string): { oldOps: DiffOp[]; newOps: DiffOp[] } {
  const a = tokenizeWords(oldText);
  const b = tokenizeWords(newText);

  const MAX_CELLS = 4_000_000;
  if (a.length * b.length > MAX_CELLS) {
    return {
      oldOps: [{ type: "equal", text: oldText }],
      newOps: [{ type: "equal", text: newText }],
    };
  }

  const ops = lcsDiff(a, b);
  const oldOps: DiffOp[] = ops
    .filter((op) => op.type !== "insert")
    .map((op) => ({ type: op.type, text: op.item }));
  const newOps: DiffOp[] = ops
    .filter((op) => op.type !== "delete")
    .map((op) => ({ type: op.type, text: op.item }));

  return { oldOps, newOps };
}

export type DiffBlock = {
  oldOps: DiffOp[];
  newOps: DiffOp[];
};

export function diffWords(oldTextRaw: string, newTextRaw: string): { blocks: DiffBlock[] } {
  const oldText = normalizeWhitespace(oldTextRaw);
  const newText = normalizeWhitespace(newTextRaw);

  const oldSegments = segmentize(oldText);
  const newSegments = segmentize(newText);

  const segOps = lcsDiff(oldSegments, newSegments);

  const blocks: DiffBlock[] = [];

  let i = 0;
  while (i < segOps.length) {
    const op = segOps[i];

    if (op.type === "equal") {
      blocks.push({
        oldOps: [{ type: "equal", text: op.item }],
        newOps: [{ type: "equal", text: op.item }],
      });
      i++;
      continue;
    }

    let j = i;
    const deletedChunks: string[] = [];
    const insertedChunks: string[] = [];
    while (j < segOps.length && segOps[j].type !== "equal") {
      if (segOps[j].type === "delete") deletedChunks.push(segOps[j].item);
      else insertedChunks.push(segOps[j].item);
      j++;
    }

    const deletedText = deletedChunks.join("");
    const insertedText = insertedChunks.join("");

    if (deletedChunks.length > 1 && deletedChunks.length === insertedChunks.length) {
      for (let k = 0; k < deletedChunks.length; k++) {
        const { oldOps, newOps } = wordLevelDiff(deletedChunks[k], insertedChunks[k]);
        blocks.push({ oldOps, newOps });
      }
    } else if (deletedText && insertedText) {
      const { oldOps, newOps } = wordLevelDiff(deletedText, insertedText);
      blocks.push({ oldOps, newOps });
    } else if (deletedText) {
      blocks.push({ oldOps: [{ type: "delete", text: deletedText }], newOps: [] });
    } else if (insertedText) {
      blocks.push({ oldOps: [], newOps: [{ type: "insert", text: insertedText }] });
    }

    i = j;
  }

  return { blocks };
}