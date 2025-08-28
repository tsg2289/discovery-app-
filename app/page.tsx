'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { DiscoveryForm } from '@/components/DiscoveryForm'
import { DocumentPreview } from '@/components/DocumentPreview'
import { Scale, FileText, Download, Sparkles } from 'lucide-react'

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [discoveryData, setDiscoveryData] = useState<any>(null)
  const [generatedDocument, setGeneratedDocument] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="discovery-card p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Scale className="w-12 h-12 text-discovery-blue mr-3" />
            <h1 className="text-4xl font-bold text-discovery-dark-blue">
              Discovery Document Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate professional discovery requests for litigation cases with AI-powered assistance. 
            Create comprehensive discovery documents instantly - with or without uploaded case documents.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input Section */}
        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="discovery-card p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-discovery-blue mr-2" />
              <h2 className="text-2xl font-bold text-discovery-dark-blue">
                Upload Case Documents (Optional)
              </h2>
            </div>
            <FileUpload 
              onFilesUploaded={setUploadedFiles} 
              uploadedFiles={uploadedFiles}
            />
          </div>

          {/* Discovery Form Section */}
          <div className="discovery-card p-6">
            <div className="flex items-center mb-4">
              <Sparkles className="w-6 h-6 text-discovery-turquoise mr-2" />
              <h2 className="text-2xl font-bold text-discovery-dark-blue">
                Discovery Request Details
              </h2>
            </div>
            <DiscoveryForm 
              onFormSubmit={setDiscoveryData}
              uploadedFiles={uploadedFiles}
              onGenerate={setGeneratedDocument}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </div>
        </div>

        {/* Right Column - Preview Section */}
        <div className="space-y-6">
          <div className="discovery-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Download className="w-6 h-6 text-discovery-blue mr-2" />
                <h2 className="text-2xl font-bold text-discovery-dark-blue">
                  Document Preview
                </h2>
              </div>
            </div>
            <DocumentPreview 
              content={generatedDocument}
              discoveryData={discoveryData}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="discovery-card p-4 text-center">
          <p className="text-sm text-gray-500">
            Professional legal discovery document generation powered by AI technology
          </p>
        </div>
      </div>
    </div>
  )
}
