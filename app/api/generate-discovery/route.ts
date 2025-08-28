import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { formData, fileCount, fileNames } = await request.json()

    console.log('Environment check:', {
      hasKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY?.length,
      keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10)
    })

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Create a comprehensive prompt for ChatGPT
    const prompt = `You are a legal assistant specializing in discovery document generation for litigation cases. Based on the following case information and uploaded documents, generate a professional discovery document.

CASE INFORMATION:
- Case Title: ${formData.caseTitle}
- Case Number: ${formData.caseNumber || 'Not provided'}
- Requesting Party: ${formData.requestingParty}
- Responding Party: ${formData.respondingParty}
- Discovery Type: ${formData.discoveryType}
- Subject Matter: ${formData.subject}
- Jurisdiction: ${formData.jurisdiction || 'Not specified'}
- Relevant Timeframe: ${formData.timeframe || 'Not specified'}
- Specific Requests: ${formData.specificRequests || 'General discovery'}
- Additional Instructions: ${formData.additionalInstructions || 'Standard professional format'}

UPLOADED DOCUMENTS: ${fileCount > 0 ? `${fileCount} files uploaded (${fileNames.join(', ')})` : 'No documents uploaded - generating based on case information only'}

INSTRUCTIONS:
1. Generate a professional ${formData.discoveryType.replace('-', ' ')} document appropriate for litigation
2. Include proper legal formatting and numbering
3. Create specific, targeted requests based on the case information provided
4. Ensure requests are relevant to the subject matter: ${formData.subject}
5. Include appropriate time limitations and scope
6. Use formal legal language and structure
7. Include standard discovery definitions and instructions
8. Make requests specific enough to be enforceable but broad enough to capture relevant information
9. If timeframe is provided, incorporate those date ranges into the requests
10. Consider the jurisdiction's discovery rules and practices
${fileCount > 0 ? '11. Reference the uploaded documents and create targeted requests based on their likely content' : '11. Create comprehensive discovery requests based solely on the case information and subject matter provided'}

FORMAT REQUIREMENTS:
- Use proper legal document formatting
- Number all requests consecutively
- Include definitions section if appropriate
- Add standard discovery instructions
- Include proper signature blocks and service information
- Ensure compliance with discovery rules

Generate a complete, professional discovery document that would be suitable for filing in court.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal assistant expert in litigation discovery. Generate professional, court-ready discovery documents with proper legal formatting and language."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content generated from OpenAI')
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error generating discovery:', error)
    return NextResponse.json(
      { error: 'Failed to generate discovery document' },
      { status: 500 }
    )
  }
}
