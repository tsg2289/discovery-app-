'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void
  uploadedFiles: File[]
}

export function FileUpload({ onFilesUploaded, uploadedFiles }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...uploadedFiles, ...acceptedFiles]
    onFilesUploaded(newFiles)
  }, [uploadedFiles, onFilesUploaded])

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    onFilesUploaded(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: true
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-discovery-blue bg-discovery-blue/10' 
            : 'border-discovery-turquoise/40 hover:border-discovery-blue hover:bg-discovery-blue/5'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-discovery-turquoise mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-discovery-blue font-medium">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              <span className="font-medium text-discovery-blue">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              PDF, DOC, DOCX, TXT files up to 10MB each
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-discovery-dark-blue mb-3">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-discovery-turquoise/20"
            >
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-discovery-blue" />
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-discovery-blue mt-0.5 flex-shrink-0" />
        <div className="text-sm text-discovery-dark-blue">
          <p className="font-medium mb-1">Optional Document Upload:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Upload documents for more targeted discovery requests</li>
            <li>Supported: Case files, pleadings, contracts, correspondence</li>
            <li>Or generate documents using just case information</li>
            <li>AI will create comprehensive requests either way</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
