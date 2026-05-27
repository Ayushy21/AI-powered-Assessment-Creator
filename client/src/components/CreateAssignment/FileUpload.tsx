'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

export default function FileUpload() {
  const { formFields, setField } = useAssignmentStore();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const validTypes = [
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const validExtensions = ['.pdf', '.txt', '.docx'];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
        alert('Please upload a PDF, TXT, or DOCX file.');
        return;
      }

      setField('fileName', file.name);

      // Read file content as text
      if (file.type === 'text/plain' || extension === '.txt') {
        const text = await file.text();
        setField('fileContent', text);
      } else {
        // For PDF/DOCX, read as base64 or just store the name
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setField('fileContent', result);
        };
        reader.readAsDataURL(file);
      }
    },
    [setField]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setField('fileName', '');
    setField('fileContent', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasFile = !!formFields.fileName;

  return (
    <div className="form-group">
      <label className="form-label">Reference Material</label>
      <div
        className={`file-upload-zone ${isDragging ? 'dragging' : ''} ${hasFile ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {hasFile ? (
          <div className="file-upload-filename">
            <File size={20} />
            <span>{formFields.fileName}</span>
            <button
              className="file-upload-remove"
              onClick={handleRemove}
              title="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="file-upload-icon">
              <Upload size={32} />
            </div>
            <p className="file-upload-text">
              {isDragging
                ? 'Drop your file here!'
                : 'Drag & drop a file here, or click to browse'}
            </p>
            <p className="file-upload-hint">Supports PDF, TXT files (optional)</p>
          </>
        )}
      </div>
    </div>
  );
}
