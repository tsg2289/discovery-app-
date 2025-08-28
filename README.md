# Discovery App - Legal Discovery Document Generator

A professional web application for generating discovery documents in litigation cases, powered by AI and featuring a modern blue/turquoise interface.

## Features

- 🤖 **AI-Powered Document Generation**: Uses ChatGPT to analyze case documents and generate professional discovery requests
- 📄 **Multiple Discovery Types**: Support for interrogatories, document requests, admissions, and depositions
- 📁 **File Upload**: Upload case documents (PDF, DOC, DOCX, TXT) for AI analysis
- 💾 **Word Document Export**: Download generated documents as professional Word files
- 🎨 **Modern UI**: Beautiful blue and turquoise interface with responsive design
- ⚖️ **Legal Compliance**: Professional formatting suitable for court filing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Discovery App
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add your `OPENAI_API_KEY` as an environment variable in Vercel dashboard
4. Deploy!

The app is optimized for Vercel deployment with proper configuration in `vercel.json`.

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key for ChatGPT integration

## Usage

1. **Upload Documents**: Upload relevant case documents (pleadings, contracts, etc.)
2. **Fill Form**: Complete the discovery request form with case details
3. **Generate**: Click "Generate Discovery Document with AI" 
4. **Review**: Preview the generated document
5. **Download**: Download as a Word document or copy the text

## Discovery Types Supported

- **Interrogatories**: Written questions for the opposing party
- **Requests for Production**: Document and evidence requests
- **Requests for Admissions**: Requests to admit or deny specific facts
- **Deposition Notices**: Notices for oral testimony
- **Combined Discovery**: Multiple discovery types in one document

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom blue/turquoise theme
- **AI Integration**: OpenAI ChatGPT API
- **Document Generation**: docx library for Word document creation
- **File Handling**: React Dropzone for file uploads
- **Deployment**: Vercel-optimized

## Legal Disclaimer

This application is designed to assist with legal document preparation but does not constitute legal advice. Always review generated documents with qualified legal counsel before filing or serving in litigation proceedings.

## License

This project is licensed under the MIT License.

---
*Deployed with Vercel & GitHub*
