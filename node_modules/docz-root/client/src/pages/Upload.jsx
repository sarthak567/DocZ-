import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { documentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { FiUpload, FiFile, FiX, FiCheckCircle, FiHash, FiCopy, FiExternalLink, FiArrowRight, FiShield } from 'react-icons/fi';
import { formatFileSize, generateHash } from '../utils/hash';
import { getExplorerUrl } from '../services/blockchain';

const DOCUMENT_TYPES = [
  { value: 'property_deed', label: 'Property Deed' },
  { value: 'affidavit', label: 'Affidavit' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'agreement', label: 'Agreement' },
  { value: 'court_order', label: 'Court Order' },
  { value: 'identification', label: 'Identification' },
  { value: 'contract', label: 'Contract' },
  { value: 'will', label: 'Will' },
  { value: 'power_of_attorney', label: 'Power of Attorney' },
  { value: 'title_deed', label: 'Title Deed' },
  { value: 'marriage_certificate', label: 'Marriage Certificate' },
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'educational_certificate', label: 'Educational Certificate' },
  { value: 'medical_record', label: 'Medical Record' },
  { value: 'business_license', label: 'Business License' },
  { value: 'tax_document', label: 'Tax Document' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

const Upload = () => {
  const { t } = useTranslation();
  const { walletAddress } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [dropzoneKey, setDropzoneKey] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));

      try {
        const hash = await generateHash(selectedFile);
        setFileHash(hash);
      } catch (error) {
        console.error('Hash error:', error);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 100 * 1024 * 1024,
    multiple: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) { toast.error('Please select a file'); return; }
    if (!title || !documentType) { toast.error('Title and document type are required'); return; }

    setUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('documentType', documentType);
      formData.append('description', description);
      formData.append('tags', tags);

      setUploadProgress(40);

      const response = await documentAPI.upload(formData);

      setUploadProgress(100);

      // Confetti
      triggerConfetti();

      setUploadResult(response.document);
      toast.success('Document uploaded & secured on blockchain!');
    } catch (error) {
      console.error('Upload error:', error);
      const errMsg = error.response?.data?.error || error.message || 'Upload failed';
      toast.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const triggerConfetti = () => {
    const colors = ['#22c55e', '#16a34a', '#4ade80', '#86efac', '#ffffff'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileHash('');
    setTitle('');
    setDocumentType('');
    setDescription('');
    setTags('');
    setUploadResult(null);
    setUploadProgress(0);
    setDropzoneKey((k) => k + 1);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  // ─── SUCCESS VIEW ───
  if (uploadResult) {
    const shareUrl = `${window.location.origin}/verify/shared/${uploadResult.id}`;

    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center animate-bounce-in">
            {/* Success Icon */}
            <div className="relative inline-flex mb-6">
              <div className="w-24 h-24 bg-brand-500/20 rounded-full flex items-center justify-center">
                <FiCheckCircle className="text-brand-400" size={48} />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center animate-bounce-in">
                <FiShield size={16} className="text-black" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-white mb-2">Secured on Blockchain!</h2>
            <p className="text-slate-400 mb-8">Your document is now permanently verified and tamper-proof.</p>

            {/* Hash Info */}
            <div className="space-y-3 mb-8 text-left">
              {[
                { label: 'Blockchain TX', value: uploadResult.blockchainTxHash, color: 'text-brand-400', isTx: true },
                { label: 'Document Hash (SHA-256)', value: uploadResult.documentHash, color: 'text-purple-400' },
                { label: 'IPFS Hash', value: uploadResult.ipfsHash, color: 'text-emerald-400' },
              ].map(({ label, value, color, isTx }) => (
                <div key={label} className="bg-dark-900/80 rounded-xl p-4 border border-dark-700/60">
                  <p className="text-xs text-slate-500 mb-1.5">{label}</p>
                  <div className="flex items-center gap-2">
                    <code className={`flex-1 text-xs font-mono ${color} break-all leading-relaxed`}>{value}</code>
                    <button onClick={() => copyToClipboard(value)} className="btn-icon flex-shrink-0">
                      <FiCopy size={13} />
                    </button>
                    {isTx && (
                      <a href={getExplorerUrl(value)} target="_blank" rel="noopener noreferrer" className="btn-icon flex-shrink-0">
                        <FiExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* QR Code */}
            <div className="bg-dark-900/80 rounded-2xl p-6 mb-8 border border-dark-700/60">
              <p className="text-xs text-slate-500 mb-4 text-center">Share Verification Link</p>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-2xl shadow-lg">
                  <QRCodeSVG value={shareUrl} size={160} level="H" includeMargin />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-brand-400 bg-dark-800 p-2 rounded-lg break-all">{shareUrl}</code>
                <button onClick={() => copyToClipboard(shareUrl)} className="btn-icon">
                  <FiCopy size={13} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/dashboard')} className="btn-accent flex-1 flex items-center justify-center gap-2 py-3">
                <FiShield size={16} />
                View Dashboard
              </button>
              <button onClick={resetForm} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3">
                <FiUpload size={16} />
                Upload Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── UPLOAD FORM ───
  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Upload Document</h1>
          <p className="text-slate-500">Your file is hashed locally before upload. Nothing is stored unprotected.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Drop Zone */}
          <div
            key={dropzoneKey}
            {...getRootProps()}
            className={`card-glow p-10 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
              isDragActive
                ? 'border-brand-500 bg-brand-500/5'
                : 'border-dark-600/60 hover:border-brand-500/30'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 bg-brand-500/15 rounded-xl flex items-center justify-center">
                  <FiFile className="text-brand-400 text-xl" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-semibold">{file.name}</p>
                  <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setFileHash(''); }}
                  className="btn-icon"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 mx-auto bg-brand-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <FiUpload className="text-brand-400 text-2xl" />
                </div>
                <p className="text-white font-semibold mb-1">
                  {isDragActive ? 'Drop your file here...' : 'Drag & drop or click to select'}
                </p>
                <p className="text-xs text-slate-600">PDF, Images, Word docs, Text · Max 100MB</p>
              </div>
            )}
          </div>

          {/* Hash Display */}
          {fileHash && (
            <div className="card p-4 border border-purple-500/10 bg-purple-500/5">
              <div className="flex items-center gap-2 mb-2">
                <FiHash className="text-purple-400" size={14} />
                <span className="text-sm font-semibold text-white">Local SHA-256 Hash</span>
              </div>
              <code className="text-xs text-purple-400 font-mono break-all leading-relaxed">{fileHash}</code>
            </div>
          )}

          {/* Form Fields */}
          <div className="card p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Document Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Property Deed - 123 Main Street"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Document Type <span className="text-red-400">*</span>
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select document type...</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this document (optional)"
                className="input-field min-h-[80px] resize-y"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="property, legal, important (comma-separated)"
                className="input-field"
              />
            </div>
          </div>

          {/* Upload Button */}
          <button
            type="submit"
            disabled={!file || !title || !documentType || uploading}
            className="btn-accent w-full flex items-center justify-center gap-2 py-4 text-base"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
                Securing on Blockchain...
                <span className="text-xs opacity-70">{uploadProgress}%</span>
              </>
            ) : (
              <>
                <FiShield size={18} />
                Upload & Secure on Polygon
                <FiArrowRight size={16} />
              </>
            )}
          </button>

          {/* Progress Bar */}
          {uploading && (
            <div className="relative h-1 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Upload;
