/**
 * XFA form injection for ZUS official PDFs.
 * Uses PDF incremental update to inject data into XFA datasets stream.
 * ZUS uses Adobe LiveCycle Designer (XFA) forms -- this is the only correct approach.
 */

import zlib from 'zlib';
import fs from 'fs';
import path from 'path';

interface DatasetsInfo {
  objNum: number;
  streamDataStart: number;
  streamDataEnd: number;
}

function findDatasetsStream(pdf: Buffer): DatasetsInfo | null {
  const CRLF = Buffer.from('stream\r\n');
  const LF = Buffer.from('stream\n');
  const END = Buffer.from('endstream');
  let pos = 0;

  while (pos < pdf.length) {
    let sIdx = pdf.indexOf(CRLF, pos);
    let markerLen = 8;
    const lfIdx = pdf.indexOf(LF, pos);
    if (lfIdx !== -1 && (sIdx === -1 || lfIdx < sIdx)) {
      sIdx = lfIdx; markerLen = 7;
    }
    if (sIdx === -1) break;

    const eIdx = pdf.indexOf(END, sIdx + markerLen);
    if (eIdx === -1) break;

    const data = pdf.slice(sIdx + markerLen, eIdx);
    try {
      const dec = zlib.inflateSync(data);
      const text = dec.toString('utf8', 0, 60);
      if (text.includes('xfa:datasets') && text.includes('xfa:data')) {
        // Find object number by scanning backwards for 'N 0 obj'
        const pre = pdf.slice(Math.max(0, sIdx - 400), sIdx).toString('latin1');
        const m = /(\d+)\s+0\s+obj/.exec(pre);
        const objNum = m ? parseInt(m[1]) : 1;
        return { objNum, streamDataStart: sIdx + markerLen, streamDataEnd: eIdx };
      }
    } catch { /* not a zlib stream */ }

    pos = eIdx + 9;
  }
  return null;
}

function getPrevXref(pdf: Buffer): number {
  const tail = pdf.slice(Math.max(0, pdf.length - 600)).toString('latin1');
  const m = /startxref\s*\r?\n\s*(\d+)/.exec(tail);
  return m ? parseInt(m[1]) : 0;
}

function getPdfSize(pdf: Buffer): number {
  const tail = pdf.slice(Math.max(0, pdf.length - 3000)).toString('latin1');
  const m = /\/Size\s+(\d+)/.exec(tail);
  return m ? parseInt(m[1]) : 9999;
}

/**
 * Inject filled XFA datasets into a ZUS PDF using incremental update.
 * Returns new PDF buffer with user data baked in.
 */
export function fillXfaForm(pdf: Buffer, xml: string): Buffer {
  const info = findDatasetsStream(pdf);
  if (!info) throw new Error('XFA datasets stream not found in this PDF');

  const compressed = zlib.deflateSync(Buffer.from(xml, 'utf8'), { level: 9 });

  const header = Buffer.from(
    `\n${info.objNum} 0 obj\n<< /Filter /FlateDecode /Length ${compressed.length} >>\nstream\r\n`
  );
  const footer = Buffer.from('\r\nendstream\nendobj\n');

  const newObjOffset = pdf.length;
  const xrefOffset = newObjOffset + header.length + compressed.length + footer.length;

  const prevXref = getPrevXref(pdf);
  const pdfSize = getPdfSize(pdf);

  const xref = [
    'xref\n',
    `${info.objNum} 1\n`,
    `${newObjOffset.toString().padStart(10, '0')} 00000 n \n`,
    'trailer\n',
    `<< /Size ${pdfSize} /Prev ${prevXref} >>\n`,
    'startxref\n',
    `${xrefOffset}\n`,
    '%%EOF\n',
  ].join('');

  return Buffer.concat([pdf, header, compressed, footer, Buffer.from(xref)]);
}

export function loadZusPdf(filename: string): Buffer {
  const p = path.join(process.cwd(), 'public', 'forms', filename);
  return fs.readFileSync(p);
}

// ---- XML builder ----

type Field = { name: string; value: string };

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildDatasetsXml(fields: Field[]): string {
  const body = fields
    .map(({ name, value }) => `<${name}>${esc(value)}</${name}>`)
    .join('\n');
  return `<xfa:datasets xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/">\n<xfa:data>\n<topmostSubform>\n${body}\n</topmostSubform>\n</xfa:data>\n</xfa:datasets>`;
}
