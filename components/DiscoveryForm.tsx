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
    caseTitle: 'Johnson v. MegaCorp Industries',
    caseNumber: 'CV-2024-007892',
    requestingParty: 'Sarah Johnson, Plaintiff',
    respondingParty: 'MegaCorp Industries, Inc., Defendant',
    discoveryType: 'interrogatories',
    subject: 'Employment discrimination and wrongful termination',
    timeframe: 'January 2022 - Present',
    specificRequests: 'The circumstances leading to plaintiff\'s termination including who made the decision, what factors were considered, when the decision was made, and the reasons given. The company\'s hiring and firing practices, any complaints or issues with plaintiff\'s performance, and whether proper procedures were followed.',
    jurisdiction: 'Superior Court of California, County of Los Angeles',
    additionalInstructions: 'Focus on establishing a pattern of discriminatory behavior and identify decision-makers and their motivations. Explore whether proper employment procedures were followed and if there was any pretext for the termination decision.'
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

      {/* Specific Requests - Dynamic based on discovery type */}
      <div>
        <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
          {formData.discoveryType === 'interrogatories' 
            ? 'Key Facts and Circumstances to Explore'
            : formData.discoveryType === 'document-requests'
            ? 'Specific Documents and Records Needed'
            : formData.discoveryType === 'admissions'
            ? 'Facts to Admit or Deny'
            : formData.discoveryType === 'depositions'
            ? 'Key Facts and Topics for Deposition Testimony'
            : 'Specific Discovery Requests'
          }
        </label>
        <textarea
          name="specificRequests"
          value={formData.specificRequests}
          onChange={handleInputChange}
          className="discovery-textarea"
          placeholder={
            formData.discoveryType === 'interrogatories'
              ? "Describe the key facts, events, and circumstances you need to explore. Focus on WHO was involved, WHAT happened, WHERE it occurred, WHEN it took place, and WHY it happened. Example: 'The circumstances leading to plaintiff's termination, who made the decision, what factors were considered, when the decision was made, and the reasons given.'"
              : formData.discoveryType === 'document-requests'
              ? "Describe specific documents, records, and materials you need. Include contracts, emails, reports, photos, recordings, databases, personnel files, financial records, etc. Example: 'All employment contracts, performance evaluations, disciplinary records, and communications regarding plaintiff's employment.'"
              : formData.discoveryType === 'admissions'
              ? "List specific facts you want the opposing party to admit or deny. Keep statements clear and specific. Example: 'That defendant terminated plaintiff's employment on [date], that no written warning was given prior to termination, that plaintiff met all performance standards.'"
              : formData.discoveryType === 'depositions'
              ? "Describe the key facts, events, and circumstances you want to explore through deposition testimony. Focus on what the deponent knows about WHO was involved, WHAT happened, WHERE events occurred, WHEN they took place, and WHY decisions were made. Example: 'The deponent's knowledge of the termination decision, their role in performance evaluations, communications with HR, and the company's disciplinary policies.'"
              : "Describe specific information or documents you need to discover. The AI will use this along with your uploaded documents to generate comprehensive discovery requests."
          }
          rows={5}
        />
      </div>

      {/* Legal Strategy and Focus - Replaces Additional Instructions */}
      <div>
        <label className="block text-sm font-medium text-discovery-dark-blue mb-2">
          {formData.discoveryType === 'interrogatories'
            ? 'Legal Theory and Strategy Focus'
            : formData.discoveryType === 'document-requests'
            ? 'Document Search Strategy'
            : formData.discoveryType === 'depositions'
            ? 'Deposition Strategy and Objectives'
            : 'Legal Strategy and Instructions'
          }
        </label>
        <textarea
          name="additionalInstructions"
          value={formData.additionalInstructions}
          onChange={handleInputChange}
          className="discovery-textarea"
          placeholder={
            formData.discoveryType === 'interrogatories'
              ? "Describe your legal theory and what you're trying to prove. What knowledge gaps do you need to fill? What admissions would help your case? Example: 'Focus on establishing a pattern of discriminatory behavior, identify decision-makers and their motivations, explore whether proper procedures were followed.'"
              : formData.discoveryType === 'document-requests'
              ? "What are you looking for in the documents? What patterns or evidence do you expect to find? Example: 'Look for evidence of discriminatory communications, inconsistent application of policies, or documentation showing pretext for termination.'"
              : formData.discoveryType === 'depositions'
              ? "What are your key objectives for this deposition? What testimony do you need to establish your case or defense? Example: 'Establish the deponent's role in the termination decision, explore their knowledge of company policies, and obtain admissions about discriminatory conduct.'"
              : "Describe your legal strategy and any specific focus areas for the discovery requests. What are you trying to prove or establish?"
          }
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={isGenerating}
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

      <div className="text-center text-sm text-discovery-blue mt-2 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium">📄 Document Upload is Optional</p>
        <p className="text-gray-600 mt-1">
          You can generate discovery documents with just the form information, or upload documents for more targeted requests.
        </p>
      </div>
    </form>
  )
}
