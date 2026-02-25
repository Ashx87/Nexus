export interface TextDiff {
  readonly added: string;
  readonly deletedCount: number;
}

/**
 * Compute the diff between two text input states.
 * Handles simple append, delete, and mixed cases (including mid-string replacement).
 * Works with Unicode/emoji (JS string length semantics).
 *
 * - deletedCount: characters removed after the common prefix (prev.length - prefixLen)
 * - added: new characters after the common prefix in the next string
 */
export function computeTextDiff(prev: string, next: string): TextDiff {
  const prefixLen = findCommonPrefixLength(prev, next);
  const deletedCount = prev.length - prefixLen;
  const added = next.slice(prefixLen);
  return { added, deletedCount };
}

function findCommonPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}
