import React, { useState, useRef } from 'react';
import { FaFilePdf, FaFileImage, FaUpload, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useUser } from '../context/UserContext';
import { API_ENDPOINTS } from '../config/api';

const isImage = (file) => file.type.startsWith('image/');
const isPDF = (file) => file.type === 'application/pdf';

const StructuredDataCard = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-neutral-500">No structured data could be extracted.</p>;
  }

  return (
    <div className="text-sm space-y-2">
      {data.patientName && <div><span className="font-bold">Patient:</span> {data.patientName}</div>}
      {data.date && <div><span className="font-bold">Date:</span> {data.date}</div>}
      {data.diagnosis && (
        <div>
          <span className="font-bold">Diagnosis:</span>{' '}
          {/* Make rendering robust: handle both string and object for diagnosis */}
          {typeof data.diagnosis === 'object' && data.diagnosis !== null
            ? [data.diagnosis.condition, data.diagnosis.description].filter(Boolean).join(' - ') || 'N/A'
            : data.diagnosis || 'N/A'}
        </div>
      )}
      {data.prescribedMedicines && data.prescribedMedicines.length > 0 && (
        <div>
          <span className="font-bold">Medicines:</span>
          <ul className="list-disc pl-6 mt-1">
            {data.prescribedMedicines.map((med, i) => (
              <li key={i}>
                {med.name || 'Unknown Medicine'}
                {med.dosage && ` - ${med.dosage}`}
                {med.frequency && ` (${med.frequency})`}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.followUpInstructions && <div><span className="font-bold">Follow-up:</span> {data.followUpInstructions}</div>}
    </div>
  );
};

const PDFUpload = ({ onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const { userData } = useUser();
  const dropRef = useRef();

  const handleFiles = (files) => {
    const arr = Array.from(files).filter(f => isPDF(f) || isImage(f));
    if (arr.length === 0) {
      setError('Only PDF and image files are allowed.');
      return;
    }
    setSelectedFiles(arr);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
    dropRef.current.classList.remove('dragover');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.remove('dragover');
  };

  const handleFileInput = (e) => {
    handleFiles(e.target.files);
  };

  const removeFile = (idx) => {
    setSelectedFiles(files => files.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one PDF or image file.');
      return;
    }
    if (!userData || !userData.profile.email) {
      setError('You must be logged in to upload documents.');
      return;
    }
    setUploading(true);
    setStatus('');
    setError('');
    const formData = new FormData();
    selectedFiles.forEach(f => formData.append('files', f));
    formData.append('userEmail', userData.profile.email);
    try {
      const res = await fetch(API_ENDPOINTS.PROCESS_DOCUMENT, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('Processing complete! You can view the results on your Medical History page.');
        setSelectedFiles([]);
        if (onUploadComplete) {
          onUploadComplete();
        }
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('medicalDocumentUploaded'));
      } else {
        setError(data.message || 'Upload failed.');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card card-alt p-4">
      <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
        <FaUpload /> Upload Medical Documents (PDF/Image)
      </h3>
      <p className="text-sm text-neutral-600 mb-4">
        Drag and drop or select multiple PDF/image files. Text will be extracted and saved to your medical history. Files are auto-deleted after upload.
      </p>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200 flex items-center gap-2">
          <FaExclamationCircle /> {error}
        </div>
      )}
      {status && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 border border-green-200 flex items-center gap-2">
          <FaCheckCircle /> {status}
        </div>
      )}
      {/* Drag and Drop Area */}
      <div
        ref={dropRef}
        className="border-2 border-dashed border-primary rounded-lg p-6 mb-4 text-center cursor-pointer bg-neutral-50 hover:bg-blue-50 transition relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input').click()}
        style={{ minHeight: 120 }}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <FaUpload className="text-3xl text-primary mb-2" />
          <span className="text-neutral-500">Drag & drop PDF or image files here, or <span className="text-primary underline">browse</span></span>
        </div>
      </div>
      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-3">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-neutral-100 rounded px-3 py-2 border">
                {isPDF(file) ? (
                  <FaFilePdf className="text-red-500" />
                ) : (
                  <FaFileImage className="text-blue-500" />
                )}
                <span className="text-sm font-medium truncate max-w-[120px]">{file.name}</span>
                <button className="ml-2 text-red-500 hover:text-red-700" onClick={e => { e.stopPropagation(); removeFile(idx); }}>
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || uploading}
        className={`btn w-full ${selectedFiles.length === 0 || uploading ? 'btn-disabled cursor-not-allowed' : 'btn-primary'}`}
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Uploading...
          </span>
        ) : (
          <span className="flex items-center gap-2"><FaUpload /> Upload</span>
        )}
      </button>
    </div>
  );
};

export default PDFUpload;