// eslint-disable-next-line @typescript-eslint/no-require-imports
const { renderToBuffer } = require('@react-pdf/renderer')
import React from 'react'
import { Z15aPdf, type Z15aData } from '@/lib/pdf/z15a'
import { Z15bPdf, type Z15bData } from '@/lib/pdf/z15b'
import { Zas53Pdf, type Zas53Data } from '@/lib/pdf/zas53'
import { ErpoPdf, type ErpoData } from '@/lib/pdf/erpo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function todayPl() {
  return new Date().toLocaleDateString('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: { formType: string; data: any }

  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { formType, data } = body
  if (!formType || !data) {
    return new Response(JSON.stringify({ error: 'Missing formType or data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const date = todayPl()
  let element: React.ReactElement
  let filename: string

  switch (formType) {
    case 'zus-z15a':
      element = React.createElement(Z15aPdf, { data: data as Z15aData, date })
      filename = `Z-15a-${(data.imieNazwisko ?? 'wniosek').replace(/\s+/g, '-')}.pdf`
      break
    case 'zus-z15b':
      element = React.createElement(Z15bPdf, { data: data as Z15bData, date })
      filename = `Z-15b-${(data.imieNazwisko ?? 'wniosek').replace(/\s+/g, '-')}.pdf`
      break
    case 'zus-zas53':
      element = React.createElement(Zas53Pdf, { data: data as Zas53Data, date })
      filename = `ZAS-53-${(data.imieNazwisko ?? 'wniosek').replace(/\s+/g, '-')}.pdf`
      break
    case 'zus-erpo':
      element = React.createElement(ErpoPdf, { data: data as ErpoData, date })
      filename = `ERPO-${(data.imieNazwisko ?? 'wniosek').replace(/\s+/g, '-')}.pdf`
      break
    default:
      return new Response(JSON.stringify({ error: `Unknown formType: ${formType}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
  }

  try {
    const buffer: Buffer = await renderToBuffer(element)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[api/pdf] renderToBuffer error:', err)
    return new Response(JSON.stringify({ error: 'PDF generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
