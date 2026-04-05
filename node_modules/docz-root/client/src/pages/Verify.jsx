import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { documentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUpload, FiFile, FiX, FiCheckCircle, FiXCircle, FiSearch, FiHash, FiFileText, FiShield, FiAlertCircle } from 'react-icons/fi';
import { formatFileSize, generateHash } from '../utils/hash';

const Verify = () => {
  const { t } = useTranslation();

  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [verifyMode, setVerifyMode] = useState('file');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [documentDetails, setDocumentDetails] = useState(null);
  const [blockchainVerified, setBlockchainVerified] = useState(null);
  const [loadingHash, setLoadingHash] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setResult(null);
      setDocumentDetails(null);
      setBlockchainVerified(null);
      setLoadingHash(true);

      try {
        const hash = await generateHash(selectedFile);
        setFileHash(hash);
      } catch (error) {
        console.error('Hash error:', error);
      } finally {
        setLoadingHash(false);
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

  const handleVerify = async () => {
    if (verifyMode === 'file' && !fileHash) {
      toast.error('Please upload a file first');
      return;
    }
    if (verifyMode === 'hash' && !hashInput.trim()) {
      toast.error('Please enter a document hash');
      return;
    }

    setVerifying(true);
    setResult(null);
    setDocumentDetails(null);
    setBlockchainVerified(null);
    setLoadingHash(false);

    try {
      let verifyData;
      if (verifyMode === 'file') {
        const fileData = await fileToBase64(file);
        verifyData = { fileData };
      } else {
        verifyData = { documentHash: hashInput.trim() };
      }

      const response = await documentAPI.verify(verifyData);
      setResult(response.result);
      // Server doesn't return blockchainVerified — derive from whether doc was found
      setBlockchainVerified(response.result === 'authentic');
      if (response.details && Object.keys(response.details).length > 0) {
        setDocumentDetails(response.details);
      }
    } catch (error) {
      console.error('Verify error:', error);
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const resetForm = () => {
    setFile(null);
    setFileHash('');
    setHashInput('');
    setResult(null);
    setDocumentDetails(null);
    setBlockchainVerified(null);
    setLoadingHash(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Verify Document</h1>
          <p className="text-slate-500">Upload a file or enter a hash to verify its authenticity on the blockchain.</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1 bg-dark-800/80 rounded-xl p-1">
            <button
              onClick={() => { setVerifyMode('file'); resetForm(); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                verifyMode === 'file' ? 'bg-brand-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiUpload size={15} /> Upload File
            </button>
            <button
              onClick={() => { setVerifyMode('hash'); resetForm(); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                verifyMode === 'hash' ? 'bg-brand-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiHash size={15} /> Enter Hash
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        {verifyMode === 'file' && (
          <div
            {...getRootProps()}
            className={`card-glow p-10 text-center cursor-pointer transition-all border-2 border-dashed mb-5 ${
              isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-dark-600/60 hover:border-brand-500/30'
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
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setFileHash(''); }} className="btn-icon">
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 mx-auto bg-brand-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <FiUpload className="text-brand-400 text-2xl" />
                </div>
                <p className="text-white font-semibold mb-1">
                  {isDragActive ? 'Drop the file here...' : 'Drag & drop or click to select'}
                </p>
                <p className="text-xs text-slate-600">PDF, Images, Word docs, Text · Max 100MB</p>
              </div>
            )}
          </div>
        )}

        {/* Hash Input */}
        {verifyMode === 'hash' && (
          <div className="card p-6 mb-5">
            <label className="block text-sm font-semibold text-slate-300 mb-3">Document Hash (SHA-256)</label>
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter the 64-character hex hash..."
              className="input-field font-mono text-sm"
            />
          </div>
        )}

        {/* Hash Display */}
        {fileHash && (
          <div className="card p-4 mb-5 border border-purple-500/10 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-1.5">
              <FiHash className="text-purple-400" size={14} />
              <span className="text-sm font-semibold text-white">Computed SHA-256 Hash</span>
            </div>
            <code className="text-xs text-purple-400 font-mono break-all leading-relaxed">{fileHash}</code>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={verifying || loadingHash || (verifyMode === 'file' && !fileHash) || (verifyMode === 'hash' && !hashInput.trim())}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 mb-8"
        >
          {verifying ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Verifying...
            </>
          ) : loadingHash ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Computing Hash...
            </>
          ) : (
            <>
              <FiShield size={18} />
              Verify on Blockchain
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className={`card p-8 text-center animate-bounce-in ${
            result === 'authentic' ? 'border-brand-500/30' : result === 'tampered' ? 'border-red-500/30' : 'border-amber-500/30'
          }`}>
            {/* Icon */}
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
              result === 'authentic' ? 'bg-brand-500/20' : result === 'tampered' ? 'bg-red-500/20' : 'bg-amber-500/20'
            }`}>
              {result === 'authentic' ? (
                <FiCheckCircle className="text-brand-400" size={48} />
              ) : result === 'tampered' ? (
                <FiXCircle className="text-red-400" size={48} />
              ) : (
                <FiSearch className="text-amber-400" size={48} />
              )}
            </div>

            <h2 className={`text-2xl font-black mb-2 ${
              result === 'authentic' ? 'text-brand-400' : result === 'tampered' ? 'text-red-400' : 'text-amber-400'
            }`}>
              {result === 'authentic' ? '✓ Document Authentic' : result === 'tampered' ? '✗ Document Tampered' : '? Not Found'}
            </h2>
            <p className="text-slate-400 mb-6">
              {result === 'authentic' ? 'This document matches the blockchain record and has not been modified.'
                : result === 'tampered' ? 'This document has been modified since it was uploaded.'
                : 'This document was not found in our records.'}
            </p>

            {/* Blockchain Status */}
            {blockchainVerified !== null && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                blockchainVerified ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                <FiShield size={14} />
                {blockchainVerified ? 'Verified on Polygon blockchain' : 'Simulated (blockchain offline)'}
              </div>
            )}

            {/* Details */}
            {documentDetails && Object.keys(documentDetails).length > 0 && (
              <div className="bg-dark-900/80 rounded-2xl p-6 text-left border border-dark-700/60">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <FiFileText size={14} className="text-brand-400" /> Document Details
                </h3>
                <div className="space-y-3">
                  {documentDetails.title && (
                    <div className="flex justify-between"><span className="text-slate-500 text-sm">Title</span><span className="text-white text-sm font-medium">{documentDetails.title}</span></div>
                  )}
                  {documentDetails.storedHash && (
                    <div>
                      <span className="text-slate-500 text-sm block mb-1">Stored Hash</span>
                      <code className="text-xs text-purple-400 font-mono break-all">{documentDetails.storedHash}</code>
                    </div>
                  )}
                  {documentDetails.uploadedOn && (
                    <div className="flex justify-between"><span className="text-slate-500 text-sm">Uploaded</span><span className="text-white text-sm">{new Date(documentDetails.uploadedOn).toLocaleString()}</span></div>
                  )}
                  {documentDetails.owner && (
                    <div className="flex justify-between"><span className="text-slate-500 text-sm">Owner</span><span className="text-white text-sm font-mono">{documentDetails.owner.substring(0, 10)}...{documentDetails.owner.substring(36)}</span></div>
                  )}
                  {documentDetails.documentType && (
                    <div className="flex justify-between"><span className="text-slate-500 text-sm">Type</span><span className="text-white text-sm">{documentDetails.documentType}</span></div>
                  )}
                  {documentDetails.ipfsHash && (
                    <div>
                      <span className="text-slate-500 text-sm block mb-1">IPFS Hash</span>
                      <code className="text-xs text-emerald-400 font-mono break-all">{documentDetails.ipfsHash}</code>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button onClick={resetForm} className="btn-secondary mt-6">
              Verify Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
