import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { formData, fileCount, fileNames } = await request.json()

    // Try both possible environment variable names
    const apiKey = process.env.OPENAI_API_KEY || process.env.openai_api_key

    console.log('Environment check:', {
      hasUpperKey: !!process.env.OPENAI_API_KEY,
      hasLowerKey: !!process.env.openai_api_key,
      finalKey: !!apiKey,
      keyLength: apiKey?.length,
      keyPrefix: apiKey?.substring(0, 10)
    })

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Initialize OpenAI with the API key
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Create a comprehensive prompt for ChatGPT
    const prompt = `You are a legal assistant specializing in discovery document generation for litigation cases. Generate high-quality, fact-anchored discovery documents that always produce more than 10 targeted questions with clear "who/what/where/when/why/how" coverage.

CASE INFORMATION:
- Case Title: ${formData.caseTitle}
- Case Number: ${formData.caseNumber || '[CASE NUMBER]'}
- Requesting Party: ${formData.requestingParty}
- Responding Party: ${formData.respondingParty}
- Discovery Type: ${formData.discoveryType}
- Subject Matter: ${formData.subject}
- Jurisdiction: ${formData.jurisdiction || 'California Superior Court'}
- Relevant Timeframe: ${formData.timeframe || '[DATE RANGE]'}
- Case Facts: ${formData.specificRequests}
- Legal Strategy: ${formData.additionalInstructions}

UPLOADED DOCUMENTS: ${fileCount > 0 ? `${fileCount} files uploaded (${fileNames.join(', ')})` : 'No documents uploaded - generating based on case information only'}

HARD REQUIREMENTS (FOLLOW EXACTLY):

1. **MINIMUM COUNT**: Always output at least 30 tailored interrogatories; prefer 35-50 for comprehensive coverage
2. **5Ws+HOW COVERAGE**: Ensure coverage across WHO/WHAT/WHERE/WHEN/WHY/HOW across the entire set
3. **FACT-ANCHORED**: Every question must tie to specific facts, dates, events, documents, or allegations provided
4. **SINGLE-ISSUE RULE**: Each interrogatory covers one discrete subject (no compound questions or subparts)
5. **PARTY-ACCURATE TERMS**: Use defined terms like "YOU" = Responding Party, "INCIDENT" = alleged event
6. **ADMISSIBILITY**: Each question must be clear, unambiguous, and answerable

CRITICAL DISCOVERY TYPE REQUIREMENTS:

${formData.discoveryType === 'interrogatories' ? `
**SPECIAL INTERROGATORIES REQUIREMENTS:**
- Generate at least 30 single-issue interrogatories, prefer 35-50 for comprehensive coverage
- Each interrogatory must be fact-anchored to the specific case facts provided: "${formData.specificRequests}"
- Cover balanced mix of: identification of persons, communications, documents/ESI, dates/locations, knowledge and contentions, conduct and causation, damages and insurance, comparative fault/affirmative defenses
- After drafting each interrogatory, ensure it references specific input facts explicitly
- If relevant facts are missing (date, location, name), ask for them in the question
- Avoid privileged material; request non-privileged facts and privilege logs where needed
- Use clear scope (timeframe, subject, custodians) - avoid vague "describe in detail"

**FACT-ANCHORING RULE FOR INTERROGATORIES:**
For each interrogatory, explicitly reference the case facts provided. Example formats:
- "Identify all persons present at the [DATE] meeting at [LOCATION] referenced in the case facts..."
- "Describe YOUR knowledge of [SPECIFIC EVENT] that occurred on [DATE]..."
- "State the factual basis for YOUR contention that [SPECIFIC ALLEGATION FROM FACTS]..."

**LEGAL STRATEGY TO INCORPORATE:**
${formData.additionalInstructions}
Tailor interrogatories to support this legal strategy and elicit knowledge that advances this position.` : 
formData.discoveryType === 'document-requests' ? `
**REQUESTS FOR PRODUCTION REQUIREMENTS:**
- Generate 15-30 targeted document requests
- Specify document categories with timeframes, custodians, and reasonable search terms
- Request native ESI with metadata where relevant
- Ask for preservation/litigation hold confirmation
- Map to interrogatories/RFAs so every factual assertion is discoverable via documents/ESI
- Each RFP must be fact-anchored to the specific documents described: "${formData.specificRequests}"

**MANDATORY: BASE ALL DOCUMENT REQUESTS ON THE SPECIFIC DOCUMENTS AND RECORDS DESCRIBED:**
The user has specified these specific documents and records needed: "${formData.specificRequests}"
You MUST create document requests that directly target these exact documents and materials. Transform each document type into targeted RFPs using formats like:
- "All documents relating to [SPECIFIC EVENT/MATTER FROM INPUT]"
- "All [DOCUMENT TYPE FROM INPUT] from [TIMEFRAME FROM INPUT]"
- "All communications regarding [SPECIFIC SUBJECT FROM INPUT]"
- "All records of [SPECIFIC ACTIVITY FROM INPUT]"

**FACT-ANCHORING RULE FOR DOCUMENT REQUESTS:**
For each RFP, explicitly reference the documents and records described in the input. Example formats:
- "All documents relating to the [SPECIFIC EVENT] referenced in the case facts, including but not limited to..."
- "All [DOCUMENT TYPE] concerning the [SPECIFIC MATTER] described in the case facts"
- "All communications between [PARTIES] regarding [SPECIFIC SUBJECT FROM INPUT]"
- "All records from [TIMEFRAME FROM INPUT] relating to [SPECIFIC ACTIVITY FROM INPUT]"

**DOCUMENT SEARCH STRATEGY TO INCORPORATE:**
${formData.additionalInstructions}
Tailor requests to capture the specific types of evidence and patterns described in this search strategy. Ensure each RFP is designed to uncover the documents that would support or refute the legal theory outlined.` :
formData.discoveryType === 'admissions' ? `
**REQUESTS FOR ADMISSIONS REQUIREMENTS:**
- Generate 10-20 concise RFAs with clean yes/no admissions on discrete facts
- Request admissions about document authenticity and elements
- Each RFA must be fact-anchored to the specific facts provided: "${formData.specificRequests}"
- Add companion RFPs for any "denied" RFA (request materials supporting the denial)

**MANDATORY: BASE ALL ADMISSIONS ON THE SPECIFIC FACTS PROVIDED:**
The user has identified these specific facts to admit or deny: "${formData.specificRequests}"
You MUST create admission requests that directly address these exact facts. Transform each fact into a clear admission request using formats like:
- "Admit that [SPECIFIC FACT FROM INPUT]"
- "Admit the genuineness of [SPECIFIC DOCUMENT FROM INPUT]"
- "Admit that on [DATE FROM INPUT], [EVENT FROM INPUT] occurred"
- "Admit that YOU [ACTION FROM INPUT]"

**FACT-ANCHORING RULE FOR ADMISSIONS:**
For each RFA, explicitly reference the case facts provided. Example formats:
- "Admit that the termination referenced in the case facts occurred on [DATE]"
- "Admit that YOU made the decision described in the case facts to [ACTION]"
- "Admit the genuineness of the [DOCUMENT TYPE] referenced in the case facts"

**LEGAL STRATEGY TO INCORPORATE:**
${formData.additionalInstructions}
Frame admissions to establish facts that advance this legal position and create strategic advantages for the case.` :
formData.discoveryType === 'depositions' ? `
**DEPOSITION NOTICE REQUIREMENTS:**
- Generate a comprehensive deposition notice with 15-25 targeted topic areas
- Include proper notice requirements and scheduling information
- Specify documents to be produced at deposition
- Each deposition topic must be fact-anchored to the specific facts provided: "${formData.specificRequests}"
- Include both general background topics and case-specific inquiry areas

**MANDATORY: BASE ALL DEPOSITION TOPICS ON THE SPECIFIC FACTS PROVIDED:**
The user has provided these specific facts and circumstances to explore through deposition: "${formData.specificRequests}"
You MUST create deposition topic areas that directly address these facts and circumstances. Transform each fact into deposition inquiry topics using formats like:
- "YOUR knowledge of [SPECIFIC EVENT FROM INPUT]"
- "All communications regarding [SPECIFIC MATTER FROM INPUT]"
- "YOUR involvement in [SPECIFIC ACTIVITY FROM INPUT]"
- "The circumstances surrounding [SPECIFIC INCIDENT FROM INPUT]"
- "Documents relating to [SPECIFIC SUBJECT FROM INPUT]"

**FACT-ANCHORING RULE FOR DEPOSITION TOPICS:**
For each topic area, explicitly reference the case facts provided. Example formats:
- "All facts relating to the [SPECIFIC EVENT] referenced in the case facts, including YOUR knowledge of..."
- "YOUR role in the [SPECIFIC DECISION/ACTION] described in the case facts"
- "All communications concerning the [SPECIFIC MATTER FROM INPUT] including dates, participants, and content"
- "Documents in YOUR possession relating to [SPECIFIC SUBJECT FROM INPUT]"

**DEPOSITION STRATEGY TO INCORPORATE:**
${formData.additionalInstructions}
Structure the deposition topics to support this legal strategy and elicit testimony that advances this position. Include topics that would establish key facts, admissions, and evidence for the case.` :
formData.discoveryType === 'combined' ? `
**COMBINED DISCOVERY REQUIREMENTS:**
- Generate Section 1: Special Interrogatories (30-50 questions)
- Generate Section 2: Requests for Admission (10-20 RFAs)  
- Generate Section 3: Requests for Production (15-30 RFPs)
- Ensure all sections are fact-anchored to: "${formData.specificRequests}"
- Map RFPs to interrogatories/RFAs for comprehensive coverage

**LEGAL STRATEGY TO INCORPORATE:**
${formData.additionalInstructions}` :
`**${formData.discoveryType.toUpperCase().replace('-', ' ')} REQUIREMENTS:**
- Generate appropriate requests for the selected discovery type
- Follow standard legal formatting and requirements
- Ensure fact-anchoring to: "${formData.specificRequests}"`}

OUTPUT FORMAT REQUIREMENTS:

A) Title line with caption placeholders
B) "Definitions and Instructions" (brief, jurisdiction-appropriate)
C) Section 1: ${formData.discoveryType === 'interrogatories' ? 'Special Interrogatories' : formData.discoveryType === 'document-requests' ? 'Requests for Production' : formData.discoveryType === 'admissions' ? 'Requests for Admission' : 'Combined Discovery'} to ${formData.respondingParty}
${formData.discoveryType === 'combined' ? 'D) Section 2: Requests for Admission to ' + formData.respondingParty + '\nE) Section 3: Requests for Production to ' + formData.respondingParty : ''}
F) End with standard proof/verification lines

QUALITY CHECKLIST (VERIFY BEFORE RETURNING):
✓ Count is met (≥30 for interrogatories; others as specified)
✓ Each question is single-issue and 5Ws/How coverage exists across the set
✓ No vague verbs; include scope (timeframe, subject, custodians)
✓ Jurisdictional compliance (California single-issue rule; no subparts)
✓ RFAs are clean yes/no admissions; related RFPs request materials supporting any denial
✓ RFPs specify ESI format where appropriate and request privilege logs
✓ Formatting: clear numbering, headings, and spacing ready for court filing
✓ FACT-ANCHORING: Every question explicitly references provided case facts

FINAL INSTRUCTION:
Return ONLY the finalized discovery document per the Output format. No commentary or explanations. If any inputs are missing, use reasonable bracketed placeholders. Generate professional discovery that is ready to file without further editing.`

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
