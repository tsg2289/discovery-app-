import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx'

export async function POST(request: NextRequest) {
  try {
    const { content, discoveryData } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      )
    }

    // Split content into paragraphs
    const paragraphs = content.split('\n\n').filter((p: string) => p.trim())

    // Create document sections
    const docSections = []

    // Add header information
    docSections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: discoveryData?.caseTitle || 'Discovery Document',
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    )

    if (discoveryData?.caseNumber) {
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Case No.: ${discoveryData.caseNumber}`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      )
    }

    if (discoveryData?.jurisdiction) {
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: discoveryData.jurisdiction,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      )
    }

    // Add content paragraphs
    paragraphs.forEach((paragraph: string) => {
      // Check if this looks like a heading
      const isHeading = paragraph.length < 100 && 
        (paragraph.includes('INTERROGATORIES') || 
         paragraph.includes('REQUESTS FOR') || 
         paragraph.includes('DEFINITIONS') ||
         paragraph.includes('INSTRUCTIONS') ||
         paragraph.toUpperCase() === paragraph)

      if (isHeading) {
        docSections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: paragraph,
                bold: true,
                size: 26,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          })
        )
      } else {
        // Regular paragraph
        docSections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: paragraph,
                size: 22,
              }),
            ],
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED,
          })
        )
      }
    })

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docSections,
        },
      ],
    })

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc)

    // Return the document as a downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Discovery_Request_${discoveryData?.caseNumber || 'Document'}.docx"`,
      },
    })
  } catch (error) {
    console.error('Error generating DOCX:', error)
    return NextResponse.json(
      { error: 'Failed to generate Word document' },
      { status: 500 }
    )
  }
}
