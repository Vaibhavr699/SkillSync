import React, { useRef, useState } from 'react';
import { ArrowUpTrayIcon, XMarkIcon, EyeIcon, CheckCircleIcon, ExclamationCircleIcon, PaperClipIcon, PhotoIcon, DocumentTextIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { uploadFile } from '../../api/files';

const getFileIcon = (file) => {
  const mimeType = file.type || '';
  if (mimeType.startsWith('image/')) return <PhotoIcon className="w-5 h-5 text-blue-500" />;
  if (mimeType === 'application/pdf') return <DocumentTextIcon className="w-5 h-5 text-red-500" />;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return <ArchiveBoxIcon className="w-5 h-5 text-yellow-500" />;
  return <PaperClipIcon className="w-5 h-5 text-gray-400" />;
};

const FileUpload = ({
  multiple = false,
  accept = '*/*',
  isProfilePhoto = false,
  resourceType = null,
  resourceId = null,
  onUploadComplete,
  disabled = false,
  sx = {},
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({}); // {filename: 'success'|'error'}
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  // NEW: Only upload when Save is clicked
  const [pendingFiles, setPendingFiles] = useState([]);

  const handleFiles = (files) => {
    const fileArr = Array.from(files);
    if (accept !== '*/*') {
      const notAllowed = fileArr.find(f => !accept.split(',').some(type => f.type.startsWith(type.trim()) || f.name.endsWith(type.trim().replace('.*', ''))));
      if (notAllowed) {
        setErrorMsg('Some files are not allowed.');
        return;
      }
    }
    setErrorMsg('');
    setPendingFiles(fileArr);
    setSelectedFiles(fileArr); // For preview
    if (isProfilePhoto && fileArr[0]) {
      setPreviewUrl(URL.createObjectURL(fileArr[0]));
    }
  };

  const handleSave = async () => {
    setUploading(true);
    let uploaded = [];
    for (const file of pendingFiles) {
      const formData = new FormData();
      formData.append('files', file);
      if (resourceType) formData.append('resourceType', resourceType);
      if (resourceId) formData.append('resourceId', resourceId);
      try {
        const res = await uploadFile(formData, (e) => {
          if (e.lengthComputable) {
            setProgress((prev) => ({ ...prev, [file.name]: Math.round((e.loaded / e.total) * 100) }));
          }
        });
        if (Array.isArray(res)) uploaded.push(...res);
        else uploaded.push(res);
        setProgress((prev) => ({ ...prev, [file.name]: 100 }));
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'success' }));
      } catch (err) {
        setProgress((prev) => ({ ...prev, [file.name]: 0 }));
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'error' }));
      }
    }
    setUploading(false);
    setPendingFiles([]);
    setSelectedFiles([]);
    if (onUploadComplete) onUploadComplete(pendingFiles);
  };

  const handleChange = (e) => {
    handleFiles(e.target.files);
    if (isProfilePhoto && e.target.files && e.target.files.length > 0) {
      setTimeout(() => handleSave(), 0);
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) inputRef.current.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  // UI for profile photo upload
  if (isProfilePhoto) {
    return (
      <div className="flex flex-col items-center gap-2" style={sx}>
        <button
          type="button"
          className="rounded-full border-2 border-dashed border-gray-300 w-24 h-24 flex items-center justify-center bg-white hover:bg-gray-50"
          onClick={handleClick}
          disabled={disabled || uploading}
          aria-label="Upload profile photo"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-full" />
          ) : (
            <ArrowUpTrayIcon className="w-10 h-10 text-gray-400" />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={false}
          style={{ display: 'none' }}
          onChange={handleChange}
          disabled={disabled || uploading}
        />
        {uploading && <div className="text-xs text-gray-500">Uploading...</div>}
      </div>
    );
  }

  // General file upload UI
  return (
    <div className="w-full" style={sx}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-white transition relative ${dragActive ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'} ${uploading ? 'opacity-60' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
        aria-label="File upload area"
      >
        <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
        <div className="font-medium text-gray-700 mb-1">{multiple ? 'Upload Files' : 'Upload File'}</div>
        <div className="text-xs text-gray-400 mb-2">Drag and drop or click to select {multiple ? 'files' : 'a file'} (images, docs, pdfs, etc.)</div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={handleChange}
          disabled={disabled || uploading}
        />
        {uploading && <div className="text-xs text-gray-500">Uploading...</div>}
        {errorMsg && <div className="text-xs text-red-500 mt-2 flex items-center gap-1"><ExclamationCircleIcon className="w-4 h-4" /> {errorMsg}</div>}
      </div>
      {/* Show previews and progress */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Selected files ({selectedFiles.length})</span>
            {selectedFiles.length > 1 && (
              <button className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1" onClick={() => { setSelectedFiles([]); setPendingFiles([]); }} aria-label="Clear all files"><XMarkIcon className="w-4 h-4" /> Clear all</button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFiles.map((file, idx) => {
              const isImage = file.type?.startsWith('image/');
              const isPdf = file.type === 'application/pdf';
              const url = isImage || isPdf ? URL.createObjectURL(file) : null;
              const status = uploadStatus[file.name];
              return (
                <div key={file.name + idx} className={`border rounded-lg p-3 flex flex-col gap-2 bg-gray-50 relative ${status === 'success' ? 'border-green-400' : status === 'error' ? 'border-red-400' : ''}`}>
                  <div className="flex items-center gap-2">
                    {getFileIcon(file)}
                    <span className="font-medium truncate text-sm">{file.name}</span>
                    <button className="ml-auto" onClick={e => { e.stopPropagation(); setSelectedFiles(selectedFiles.filter((_, i) => i !== idx)); setPendingFiles(pendingFiles.filter((_, i) => i !== idx)); }} aria-label={`Remove ${file.name}`}>
                      <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                  {isImage && url && (
                    <img src={url} alt="Preview" className="w-full h-32 object-cover rounded" />
                  )}
                  {isPdf && url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline flex items-center gap-1"><EyeIcon className="w-4 h-4" /> Preview PDF</a>
                  )}
                  <div className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</div>
                  {progress[file.name] !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress[file.name]}%` }}></div>
                    </div>
                  )}
                  {status === 'success' && <div className="flex items-center gap-1 text-green-600 text-xs mt-1"><CheckCircleIcon className="w-4 h-4" /> Uploaded</div>}
                  {status === 'error' && <div className="flex items-center gap-1 text-red-600 text-xs mt-1"><ExclamationCircleIcon className="w-4 h-4" /> Failed</div>}
                </div>
              );
            })}
          </div>
          {/* Save button */}
          {pendingFiles.length > 0 && (
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={handleSave}
              disabled={uploading}
            >
              {uploading ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload; 