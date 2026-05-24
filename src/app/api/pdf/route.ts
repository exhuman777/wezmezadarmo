/**
 * POST /api/pdf
 * Fills official ZUS PDF forms using AcroForm field filling (Z-15A/B, ZAS-53, PEL)
 * or generates text-based PDFs (ERPO).
 */

import { buildZas53Pdf, type Zas53WizardData } from '@/lib/forms/zas53-filler';
import { buildZ15bPdf, type Z15bWizardData } from '@/lib/forms/z15b-filler';
import { buildZ15aPdf, type Z15aWizardData } from '@/lib/forms/z15a-filler';
import { buildPelPdf, type PelWizardData } from '@/lib/forms/pel-filler';
import { buildErpoPdf, type ErpoWizardData } from '@/lib/forms/erpo-filler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: { formType: string; data: any };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { formType, data } = body;
  if (!formType || !data) {
    return new Response(JSON.stringify({ error: 'Missing formType or data' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let pdfBuffer: Buffer;
    let filename: string;

    switch (formType) {
      case 'zus-zas53':
        pdfBuffer = await buildZas53Pdf(data as Zas53WizardData);
        filename = `ZAS-53-${slug(data.imie, data.nazwisko)}.pdf`;
        break;
      case 'zus-z15b':
        pdfBuffer = await buildZ15bPdf(data as Z15bWizardData);
        filename = `Z-15B-${slug(data.imie, data.nazwisko)}.pdf`;
        break;
      case 'zus-z15a':
        pdfBuffer = await buildZ15aPdf(data as Z15aWizardData);
        filename = `Z-15A-${slug(data.imie, data.nazwisko)}.pdf`;
        break;
      case 'zus-pel':
        pdfBuffer = await buildPelPdf(data as PelWizardData);
        filename = `PEL-${slug(data.imie, data.nazwisko)}.pdf`;
        break;
      case 'zus-erpo':
        pdfBuffer = await buildErpoPdf(data as ErpoWizardData);
        filename = `ERPO-${slug(data.imieNazwisko?.split(' ')[0] || '', data.imieNazwisko?.split(' ').slice(1).join('-') || '')}.pdf`;
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown formType: ${formType}` }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[api/pdf] error:', err);
    return new Response(JSON.stringify({ error: 'PDF generation failed', detail: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}

function slug(imie: string, nazwisko: string): string {
  return `${imie || 'X'}-${nazwisko || 'X'}`.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
}
