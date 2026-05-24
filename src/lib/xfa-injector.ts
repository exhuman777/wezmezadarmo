/**
 * Coordinate-based PDF stamping for ZUS official forms.
 * Loads original ZUS PDF and draws user data text at exact field positions.
 * Works in any PDF viewer (Chrome, Preview, Firefox, Adobe Reader).
 *
 * Uses embedded Roboto font for full Polish diacritics support (ą ć ę ł ń ó ś ź ż).
 *
 * Coordinate system:
 *   - pdftotext bbox: yMin from top-left origin
 *   - pdf-lib drawText: y from bottom-left origin
 *   - Conversion: pdf_lib_y = page_height - bbox_yMin - font_size_adjustment
 *   - Page height for A4: 841.89 pt
 */

import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

export function loadZusPdf(filename: string): Buffer {
  const p = path.join(process.cwd(), 'public', 'forms', filename);
  return fs.readFileSync(p);
}

let _cachedFont: Uint8Array | null = null;
function loadRobotoFont(): Uint8Array {
  if (_cachedFont) return _cachedFont;
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf');
  _cachedFont = new Uint8Array(fs.readFileSync(fontPath));
  return _cachedFont;
}

export type FieldStamp = {
  page: number; // 0-indexed
  x: number;
  y: number; // pdf-lib coords (from bottom-left)
  text: string;
  size?: number;
};

export async function stampPdf(
  pdfBytes: Buffer,
  stamps: FieldStamp[]
): Promise<Buffer> {
  const doc = await PDFDocument.load(pdfBytes);
  doc.registerFontkit(fontkit);

  const robotoBytes = loadRobotoFont();
  const font = await doc.embedFont(robotoBytes, { subset: true });
  const pages = doc.getPages();

  for (const stamp of stamps) {
    if (!stamp.text) continue;
    const page = pages[stamp.page];
    if (!page) continue;
    page.drawText(stamp.text, {
      x: stamp.x,
      y: stamp.y,
      size: stamp.size ?? 9,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return Buffer.from(await doc.save());
}

/* ── AcroForm field-based filling ────────────────────────────── */

export type FormFieldEntry = {
  fieldName: string;
  value: string;
  type?: 'text' | 'check';
};

export async function fillFormByName(
  pdfBytes: Buffer,
  entries: FormFieldEntry[],
): Promise<Buffer> {
  const doc = await PDFDocument.load(pdfBytes);
  const form = doc.getForm();

  for (const entry of entries) {
    if (!entry.value) continue;
    try {
      if (entry.type === 'check') {
        const cb = form.getCheckBox(entry.fieldName);
        if (entry.value === 'true' || entry.value === 'tak') cb.check();
      } else {
        const tf = form.getTextField(entry.fieldName);
        tf.setText(entry.value.toUpperCase());
      }
    } catch {
      // Field not found or wrong type - skip silently (some fields optional)
    }
  }

  form.flatten();
  return Buffer.from(await doc.save());
}

/* ── Text-only PDF generation (no template) ──────────────────── */

export type TextSection = {
  heading: string;
  lines: string[];
};

export async function buildTextPdf(
  title: string,
  sections: TextSection[],
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const robotoBytes = loadRobotoFont();
  const font = await doc.embedFont(robotoBytes, { subset: true });

  const margin = 50;
  const pageW = 595.28;
  const pageH = 841.89;
  const lineH = 16;
  const headingSize = 13;
  const bodySize = 10;
  const titleSize = 16;

  let page = doc.addPage([pageW, pageH]);
  let cursorY = pageH - margin;

  const ensureSpace = (needed: number) => {
    if (cursorY - needed < margin) {
      page = doc.addPage([pageW, pageH]);
      cursorY = pageH - margin;
    }
  };

  // Title
  page.drawText(title, { x: margin, y: cursorY, size: titleSize, font, color: rgb(0, 0, 0) });
  cursorY -= lineH * 2;

  for (const section of sections) {
    ensureSpace(lineH * 3);
    // Section heading
    page.drawText(section.heading, { x: margin, y: cursorY, size: headingSize, font, color: rgb(0.2, 0.2, 0.2) });
    cursorY -= lineH * 1.5;

    for (const line of section.lines) {
      if (!line) continue;
      ensureSpace(lineH);
      page.drawText(line, { x: margin + 10, y: cursorY, size: bodySize, font, color: rgb(0, 0, 0) });
      cursorY -= lineH;
    }
    cursorY -= lineH * 0.5;
  }

  return Buffer.from(await doc.save());
}
