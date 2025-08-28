'use client'

import { useState } from 'react'
import { Download, FileText, Loader2, Copy, Check } from 'lucide-react'

interface DocumentPreviewProps {
  content: string
  discoveryData: any
  isGenerating: boolean
}

export function DocumentPreview({ content, discoveryData, isGenerating }: DocumentPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const copyToClipboard = async () => {
    if (content) {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadAsWord = async () => {
    if (!content || !discoveryData) {
      alert('No document content available to download')
      return
    }
    
    setIsDownloading(true)
    try {
      console.log('Starting download...', { content: content.substring(0, 100), discoveryData })
      
      const response = await fetch('/api/generate-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          discoveryData
        }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.error('Server error:', errorData)
        throw new Error(`Server error: ${errorData.error || 'Unknown error'}`)
      }

      const blob = await response.blob()
      console.log('Blob created:', blob.size, blob.type)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Discovery_Request_${discoveryData.caseNumber || 'Document'}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log('Download completed successfully')
    } catch (error) {
      console.error('Error downloading document:', error)
      alert(`Error downloading document: ${error.message}`)
    } finally {
      setIsDownloading(false)
    }
  }

  if (isGenerating) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-discovery-blue animate-spin mx-auto mb-4" />
          <p className="text-discovery-dark-blue font-medium">
            AI is analyzing your documents and generating discovery requests...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a few moments
          </p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-discovery-turquoise/50 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No document generated yet</p>
          <p className="text-sm text-gray-400">
            Upload documents and fill out the form to generate discovery requests
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={downloadAsWord}
          disabled={isDownloading}
          className="discovery-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download DOCX File</span>
            </>
          )}
        </button>
        
        <button
          onClick={copyToClipboard}
          className="bg-discovery-turquoise hover:bg-discovery-teal text-white font-semibold py-3 px-6 rounded-lg 
                   transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                   flex items-center space-x-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Text</span>
            </>
          )}
        </button>
      </div>

      {/* Document Preview */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-inner">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
          <h3 className="font-medium text-discovery-dark-blue flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Discovery Document Preview
          </h3>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
              {content}
            </pre>
          </div>
        </div>
      </div>

      {/* Document Info */}
      {discoveryData && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-discovery-dark-blue mb-2">Document Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Case:</span>
              <p className="text-gray-800">{discoveryData.caseTitle}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Type:</span>
              <p className="text-gray-800 capitalize">{discoveryData.discoveryType?.replace('-', ' ')}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Requesting Party:</span>
              <p className="text-gray-800">{discoveryData.requestingParty}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Responding Party:</span>
              <p className="text-gray-800">{discoveryData.respondingParty}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
