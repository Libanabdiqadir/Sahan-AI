/**
 * Resume layout pagination utilities for @react-pdf/renderer.
 *
 * @react-pdf/renderer cannot measure element heights at render time, so we
 * pre-calculate content distribution in JavaScript before rendering and
 * explicitly decide which content lands on each PDF page.
 *
 * All units are PDF points (1 pt = 1/72 inch).  A4 = 595.28 × 841.89 pt.
 */

// ── Word-aware line estimator ─────────────────────────────────────────────────

/**
 * Estimates the number of wrapped lines a string produces at the given
 * characters-per-line limit using word-boundary wrapping.
 */
export function estimateLines(text: string, cpl: number): number {
  if (!text?.trim()) return 0;
  const words = text.trim().split(/\s+/);
  let lines = 1;
  let col   = 0;
  for (const w of words) {
    if (col === 0) {
      col = w.length;
    } else if (col + 1 + w.length > cpl) {
      lines++;
      col = w.length;
    } else {
      col += 1 + w.length;
    }
  }
  return lines;
}

// ── Block height estimators (returns pt) ─────────────────────────────────────

// Body bullet: 9 pt text, 1.35 line-height, 3 pt bottom margin.
// The bullet dot glyph renders at fontSize 13 / lineHeight 1.4 = 18.2 pt min.
// Row height is max(text height, dot height) + margin.
function bulletLineH(text: string, cpl: number): number {
  const textH = estimateLines(text, cpl) * 9 * 1.35;
  return Math.max(textH, 18.2) + 3;
}

/** Section header (title row + horizontal rule). */
export const SEC_H = 24;

/** Experience entry block. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function expBlockH(exp: Record<string, any>, cpl: number): number {
  const companyRow = 15;  // 10.5 pt bold × 1.35 + 1 pt margin
  const roleRow    = 18;  // 9.5 pt italic × 1.35 + 5 pt margin
  const bulletsH   = ((exp.responsibilities as string[]) ?? [])
    .reduce((acc, r) => acc + bulletLineH(r, cpl), 0);
  return companyRow + roleRow + bulletsH + 5; // 5 pt block margin
}

/** Project entry block. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function projBlockH(p: Record<string, any>, cpl: number): number {
  return (
    15 +
    (p.role_title           ? 14 : 0) +
    ((p.link || p.url)      ? 11 : 0) +
    (p.description          ? bulletLineH(String(p.description), cpl) : 0) +
    ((p.highlights as string[]) ?? [])
      .reduce((acc, h) => acc + bulletLineH(h, cpl), 0) +
    5
  );
}

/** Education entry block. */
export const EDU_BLOCK_H = 34; // degree row + school row + margin

/** Summary section: header + wrapped text + section gap. */
export function summarySecH(text: string, cpl: number): number {
  return SEC_H + estimateLines(text, cpl) * 9 * 1.35 + 10;
}

// ── Page content model ────────────────────────────────────────────────────────

export interface ContentPage {
  hasSummary:     boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expItems:       Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projItems:      Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eduItems:       Record<string, any>[];
  showExpHeader:  boolean;
  showProjHeader: boolean;
  showEduHeader:  boolean;
}

function freshPage(): ContentPage {
  return {
    hasSummary:     false,
    expItems:       [],
    projItems:      [],
    eduItems:       [],
    showExpHeader:  false,
    showProjHeader: false,
    showEduHeader:  false,
  };
}

function hasContent(p: ContentPage): boolean {
  return (
    p.hasSummary ||
    p.expItems.length  > 0 ||
    p.projItems.length > 0 ||
    p.eduItems.length  > 0
  );
}

// ── Paginator ─────────────────────────────────────────────────────────────────

export interface PaginateInput {
  summary?:    string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  experience?: Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects?:   Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  education?:  Record<string, any>[];
}

/**
 * Distributes resume content across pages with intelligent break logic.
 *
 * Rules:
 *  - Section titles are never orphaned — they stay with their first entry.
 *  - Section titles are re-shown on every continuation page for readability.
 *  - Individual entries are atomic (never split mid-block).
 *  - A 6 % height-estimate safety buffer prevents edge clipping.
 *
 * @param content     Resume data to paginate.
 * @param firstPageH  Usable main-panel height (pt) on page 1.
 * @param contPageH   Usable content height (pt) on pages 2+.
 * @param cpl         Average characters per line for body / bullet text.
 * @returns           At least one ContentPage.
 */
export function paginate(
  content:    PaginateInput,
  firstPageH: number,
  contPageH:  number,
  cpl:        number,
): ContentPage[] {
  // 6 % safety buffer: dividing available height by 1.06 means we only use ~94 %
  // of each page's theoretical capacity.  This absorbs CPL estimation error
  // (font kerning, punctuation, short words) so the last entry on a page is
  // never clipped in the exported PDF.
  const SAFETY = 1.06;

  const pages: ContentPage[] = [];
  let pg    = freshPage();
  let used  = 0;
  let pgIdx = 0;
  let expHdr = false, projHdr = false, eduHdr = false;

  const avail = () => (pgIdx === 0 ? firstPageH : contPageH) / SAFETY;

  const flush = () => {
    pages.push(pg);
    pg    = freshPage();
    used  = 0;
    pgIdx++;
    expHdr = projHdr = eduHdr = false;
  };

  /**
   * Place one entry on the current page (or the next if it doesn't fit).
   * After a page flush, the section header is always re-shown because the
   * header-paid flags are reset inside flush().
   */
  function placeEntry(
    entryH:  number,
    hdrPaid: boolean,
    setHdr:  () => void,
    addItem: () => void,
  ) {
    const hdrCost = hdrPaid ? 0 : SEC_H;
    const needed  = hdrCost + entryH;

    if (used > 0 && used + needed > avail()) {
      // Item doesn't fit — break to next page.
      flush();
      // On the fresh page the section header is always included.
      setHdr();
      addItem();
      used += SEC_H + entryH;
    } else {
      if (!hdrPaid) setHdr();
      addItem();
      used += needed;
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────
  if (content.summary?.trim()) {
    const h = summarySecH(content.summary, cpl);
    if (used > 0 && used + h > avail()) flush();
    pg.hasSummary = true;
    used += h;
  }

  // ── Experience ─────────────────────────────────────────────────────────
  for (const exp of content.experience ?? []) {
    placeEntry(
      expBlockH(exp, cpl),
      expHdr,
      () => { pg.showExpHeader = true;  expHdr  = true; },
      () => { pg.expItems.push(exp); },
    );
  }

  // ── Projects ───────────────────────────────────────────────────────────
  for (const proj of content.projects ?? []) {
    placeEntry(
      projBlockH(proj, cpl),
      projHdr,
      () => { pg.showProjHeader = true; projHdr = true; },
      () => { pg.projItems.push(proj); },
    );
  }

  // ── Education ──────────────────────────────────────────────────────────
  for (const edu of content.education ?? []) {
    placeEntry(
      EDU_BLOCK_H,
      eduHdr,
      () => { pg.showEduHeader = true;  eduHdr  = true; },
      () => { pg.eduItems.push(edu); },
    );
  }

  if (hasContent(pg)) pages.push(pg);
  return pages.length > 0 ? pages : [freshPage()];
}
