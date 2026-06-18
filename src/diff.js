// diff.js
//
// Pure line-diff utility for showing a code-review-style +/- diff between two
// versions of a markdown document. Uses a classic Longest Common Subsequence
// (LCS) over lines so that unchanged lines stay aligned and only genuine
// insertions/deletions are marked.
//
// No DOM, no React, no imports, no side effects — just pure functions.
//
// Worked example (traced by hand to verify the backtrack):
//   old = ["a", "b", "c"]
//   new = ["a", "x", "c"]
//
//   LCS DP table dp[i][j] = LCS length of old[i..] and new[j..]:
//                 j=0(a) j=1(x) j=2(c) j=3(end)
//     i=0 (a)       2      1      1      0
//     i=1 (b)       1      1      1      0
//     i=2 (c)       1      1      1      0
//     i=3 (end)     0      0      0      0
//
//   Backtrack from (0,0):
//     old[0]="a" === new[0]="a"          -> same("a"), go (1,1)
//     old[1]="b" !== new[1]="x":
//         dp[2][1]=1 >= dp[1][2]=1 ... compare: dp[i+1][j] vs dp[i][j+1]
//         dp[2][1]=1, dp[1][2]=1 -> tie; we emit del first -> del("b"), go (2,1)
//     old[2]="c" !== new[1]="x":
//         dp[3][1]=0 < dp[2][2]=1 -> add("x"), go (2,2)
//     old[2]="c" === new[2]="c"          -> same("c"), go (3,3) done
//
//   Result: same(a), del(b), add(x), same(c)  ✓

/**
 * Compute a line-level diff between two texts.
 *
 * @param {string} oldText
 * @param {string} newText
 * @returns {Array<{type: 'same'|'del'|'add', text: string}>}
 */
export function lineDiff(oldText, newText) {
  // Both empty -> empty diff.
  if (oldText === '' && newText === '') {
    return [];
  }

  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const n = oldLines.length;
  const m = newLines.length;

  // dp[i][j] = length of LCS of oldLines[i..] and newLines[j..].
  // Sized (n+1) x (m+1), last row/column are zeros (base case).
  const dp = new Array(n + 1);
  for (let i = 0; i <= n; i++) {
    dp[i] = new Array(m + 1).fill(0);
  }

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (oldLines[i] === newLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack from (0,0) producing rows in document order.
  const rows = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (oldLines[i] === newLines[j]) {
      rows.push({ type: 'same', text: oldLines[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      // Removing old line keeps an LCS at least as long -> deletion first.
      rows.push({ type: 'del', text: oldLines[i] });
      i++;
    } else {
      rows.push({ type: 'add', text: newLines[j] });
      j++;
    }
  }

  // Drain any remaining old lines (deletions).
  while (i < n) {
    rows.push({ type: 'del', text: oldLines[i] });
    i++;
  }

  // Drain any remaining new lines (additions).
  while (j < m) {
    rows.push({ type: 'add', text: newLines[j] });
    j++;
  }

  return rows;
}

/**
 * Summarize a diff produced by lineDiff.
 *
 * @param {Array<{type: 'same'|'del'|'add', text: string}>} rows
 * @returns {{added: number, removed: number}}
 */
export function diffStats(rows) {
  let added = 0;
  let removed = 0;
  for (const row of rows) {
    if (row.type === 'add') {
      added++;
    } else if (row.type === 'del') {
      removed++;
    }
  }
  return { added, removed };
}
