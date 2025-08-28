'use client'

import { useState } from 'react'
import { Loader2, Send, Bot } from 'lucide-react'

interface DiscoveryFormProps {
  onFormSubmit: (data: any) => void
  uploadedFiles: File[]
  onGenerate: (content: string) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

export function DiscoveryForm({ 
  onFormSubmit, 
  uploadedFiles, 
  onGenerate, 
  isGenerating, 
  setIsGenerating 
}: DiscoveryFormProps) {
  const [formData, setFormData] = useState({
    caseTitle: '',
    caseNumber: '',
    requestingParty: '',
    respondingParty: '',
    discoveryType: 'interrogatories',
    subject: '',
    timeframe: '',
    specificRequests: '',
    jurisdiction: '',
    additionalInstructions: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one document before generating discovery requests.')
      return
    }

    setIsGenerating(true)
    onFormSubmit(formData)

    try {
      // Call the API to generate discovery document
      const response = await fetch('/api/generate-discovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          fileCount: uploadedFiles.length,
          fileNames: uploadedFiles.map(f => f.name)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate discovery document')
      }

      const result = await response.json()
      onGenerate(result.content)
    } catch (error) {
      console.error('Error generating discovery:', error)
      alert('Error generating discovery document. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Case Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
            Case Title *
          </label>
          <input
            type="text"
            name="caseTitle"
            value={formData.caseTitle}
            onChange={handleInputChange}
            className="discovery-input"
            placeholder="e.g., Smith v. Johnson"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
            Case Number
          </label>
          <input
            type="text"
            name="caseNumber"
            value={formData.caseNumber}
            onChange={handleInputChange}
            className="discovery-input"
            placeholder="e.g., CV-2024-001234"
          />
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
            Requesting Party *
          </label>
          <input
            type="text"
            name="requestingParty"
            value={formData.requestingParty}
            onChange={handleInputChange}
            className="discovery-input"
            placeholder="Party making the discovery request"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
            Responding Party *
          </label>
          <input
            type="text"
            name="respondingParty"
            value={formData.respondingParty}
            onChange={handleInputChange}
            className="discovery-input"
            placeholder="Party receiving the discovery request"
            required
          />
        </div>
      </div>

      {/* Discovery Type and Jurisdiction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
            Discovery Type *
          </label>
          <select
            name="discoveryType"
            value={formData.discoveryType}
            onChange={handleInputChange}
            className="discovery-select"
            required
          >
            <option value="interrogatories">Interrogatories</option>
            <option value="document-requests">Requests for Production of Documents</option>
            <option value="admissions">Requests for Admissions</option>
            <option value="depositions">Deposition Notice</option>
            <option value="combined">Combined Discovery Requests</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
            Jurisdiction
          </label>
          <input
            type="text"
            name="jurisdiction"
            value={formData.jurisdiction}
            onChange={handleInputChange}
            className="discovery-input"
            placeholder="e.g., Superior Court of California"
          />
        </div>
      </div>

      {/* Subject and Timeframe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
            Subject Matter *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="discovery-input"
            placeholder="e.g., Contract breach, Personal injury, etc."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
            Relevant Timeframe
          </label>
          <input
            type="text"
            name="timeframe"
            value={formData.timeframe}
            onChange={handleInputChange}
            className="discovery-input"
            placeholder="e.g., January 2020 - December 2023"
          />
        </div>
      </div>

      {/* Specific Requests */}
      <div>
        <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
          Specific Discovery Requests
        </label>
        <textarea
          name="specificRequests"
          value={formData.specificRequests}
          onChange={handleInputChange}
          className="discovery-textarea"
          placeholder="Describe specific information or documents you need to discover. The AI will use this along with your uploaded documents to generate comprehensive discovery requests."
          rows={4}
        />
      </div>

      {/* Additional Instructions */}
      <div>
        <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
          Additional Instructions for AI
        </label>
        <textarea
          name="additionalInstructions"
          value={formData.additionalInstructions}
          onChange={handleInputChange}
          className="discovery-textarea"
          placeholder="Any specific instructions for the AI to consider when generating the discovery document (tone, style, specific legal standards, etc.)"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={isGenerating || uploadedFiles.length === 0}
          className="discovery-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Discovery Document...</span>
            </>
          ) : (
            <>
              <Bot className="w-5 h-5" />
              <span>Generate Discovery Document with AI</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {uploadedFiles.length === 0 && (
        <p className="text-center text-sm text-red-500 mt-2">
          Please upload at least one document to generate discovery requests
        </p>
      )}
    </form>
  )
}
