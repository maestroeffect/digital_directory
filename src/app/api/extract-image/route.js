import { NextResponse } from 'next/server'

import Mercury from '@postlight/mercury-parser'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  console.log(`🔍 Extracting image from: ${url}`)

  try {
    // Fetch the HTML of the page first
    const pageResponse = await fetch(url)

    if (!pageResponse.ok) throw new Error('Failed to fetch page HTML')

    const html = await pageResponse.text()

    // Parse the content using Mercury
    const parsedData = await Mercury.parse(url, { html })

    return NextResponse.json({ image: parsedData.lead_image_url || null }, { status: 200 })
  } catch (error) {
    console.error('Error extracting image:', error)

    return NextResponse.json({ error: 'Failed to extract image' }, { status: 500 })
  }
}
