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

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
