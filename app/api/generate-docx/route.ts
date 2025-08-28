import { NextRequest, NextResponse } from 'next/server'
import PizZip from 'pizzip'

export async function POST(request: NextRequest) {
  try {
    const { content, discoveryData } = await request.json()

    console.log('DOCX generation started', { 
      contentLength: content?.length, 
      discoveryData: discoveryData 
    })

    if (!content) {
      console.error('No content provided')
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      )
    }

    // Create a minimal DOCX file structure
    const zip = new PizZip()

    // Add the required DOCX structure
    // 1. _rels/.rels
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`)

    // 2. [Content_Types].xml
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`)

    // 3. word/_rels/document.xml.rels
    zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`)

    // 4. word/document.xml - the main content
    let documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>`

    // Add title if exists
    if (discoveryData?.caseTitle) {
      documentXml += `
<w:p>
<w:pPr><w:jc w:val="center"/></w:pPr>
<w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${escapeXml(discoveryData.caseTitle)}</w:t></w:r>
</w:p>`
    }

    // Add case number if exists
    if (discoveryData?.caseNumber) {
      documentXml += `
<w:p>
<w:pPr><w:jc w:val="center"/></w:pPr>
<w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Case No.: ${escapeXml(discoveryData.caseNumber)}</w:t></w:r>
</w:p>`
    }

    // Add jurisdiction if exists
    if (discoveryData?.jurisdiction) {
      documentXml += `
<w:p>
<w:pPr><w:jc w:val="center"/></w:pPr>
<w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>${escapeXml(discoveryData.jurisdiction)}</w:t></w:r>
</w:p>`
    }

    // Add empty paragraph for spacing
    documentXml += `<w:p><w:r><w:t></w:t></w:r></w:p>`

    // Process content into paragraphs
    const paragraphs = content.split('\n\n').filter((p: string) => p.trim())
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        // Check if it's a heading (contains certain keywords or is all caps)
        const isHeading = paragraph.length < 150 && (
          paragraph.includes('INTERROGATOR') || 
          paragraph.includes('REQUEST') || 
          paragraph.includes('DEFINITION') ||
          paragraph.includes('INSTRUCTION') ||
          /^[A-Z\s]+$/.test(paragraph.trim()) ||
          /^\d+\./.test(paragraph.trim())
        )

        if (isHeading) {
          documentXml += `
<w:p>
<w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>${escapeXml(paragraph.trim())}</w:t></w:r>
</w:p>`
        } else {
          // Split long paragraphs by sentences for better formatting
          const sentences = paragraph.split(/(?<=[.!?])\s+/)
          let currentParagraph = ''
          
          for (const sentence of sentences) {
            if (currentParagraph.length + sentence.length > 1000) {
              // Add current paragraph and start new one
              if (currentParagraph.trim()) {
                documentXml += `
<w:p>
<w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>${escapeXml(currentParagraph.trim())}</w:t></w:r>
</w:p>`
              }
              currentParagraph = sentence
            } else {
              currentParagraph += (currentParagraph ? ' ' : '') + sentence
            }
          }
          
          // Add final paragraph
          if (currentParagraph.trim()) {
            documentXml += `
<w:p>
<w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>${escapeXml(currentParagraph.trim())}</w:t></w:r>
</w:p>`
          }
        }
      }
    }

    documentXml += `
</w:body>
</w:document>`

    zip.file('word/document.xml', documentXml)

    console.log('DOCX structure created, generating buffer...')

    // Generate the DOCX file
    const buffer = zip.generate({ type: 'nodebuffer' })
    
    console.log('DOCX buffer generated, size:', buffer.length)

    // Return the DOCX file
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Discovery_Request_${(discoveryData?.caseNumber || 'Document').replace(/[^a-zA-Z0-9]/g, '_')}.docx"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating DOCX:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate DOCX document', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to escape XML characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}


