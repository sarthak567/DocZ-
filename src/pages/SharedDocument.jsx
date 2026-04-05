import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { documentAPI } from '../services/api';
import { FiFile, FiCheckCircle, FiXCircle, FiAlertCircle, FiHome, FiShield, FiUser } from 'react-icons/fi';

const SharedDocument = () => {
  const { t } = useTranslation();
  const { linkId } = useParams();

  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null);
  const [sharedBy, setSharedBy] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { fetchSharedDocument(); }, [linkId]);

  const fetchSharedDocument = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await documentAPI.accessSharedLink(linkId);
      setDocument(response.document);
      setSharedBy(response.sharedBy);
    } catch (err) {
      setError(err.response?.status === 404 ? 'not_found' : 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading shared document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="card p-8 text-center max-w-md">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <FiAlertCircle className="text-red-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            {error === 'not_found' ? 'Link Not Found' : 'Something Went Wrong'}
          </h2>
          <p className="text-slate-500 mb-6">
            {error === 'not_found' ? 'This shared link may have expired or does not exist.' : 'An error occurred while loading the document.'}
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2"><FiHome size={16} /> Go to Home</Link>
        </div>
      </div>
    );
  }

  const isRevoked = document?.isRevoked || document?.status === 'revoked';

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <span className="text-white font-black text-sm">D+</span>
            </div>
            <span className="text-xl font-bold gradient-text">DocZ+</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Shared Document</h1>
          <p className="text-slate-500">Verified document from DocZ+ blockchain platform</p>
        </div>

        {/* Document Card */}
        <div className={`card p-8 ${isRevoked ? 'border-red-500/20' : 'border-brand-500/20'}`}>
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
              isRevoked ? 'bg-red-500/10' : 'bg-brand-500/10'
            }`}>
              {isRevoked ? (
                <FiXCircle className="text-red-400 text-3xl" />
              ) : (
                <FiCheckCircle className="text-brand-400 text-3xl" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-1">{document?.title}</h2>
              <p className="text-slate-500 text-sm">{document?.documentType}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div className="bg-dark-900/80 rounded-xl p-4">
              <p className="text-slate-500 text-xs mb-1">Status</p>
              <p className={`font-bold ${isRevoked ? 'text-red-400' : 'text-brand-400'}`}>{isRevoked ? 'Revoked' : 'Verified'}</p>
            </div>
            <div className="bg-dark-900/80 rounded-xl p-4">
              <p className="text-slate-500 text-xs mb-1">Shared By</p>
              <p className="text-white font-mono text-xs">{sharedBy?.substring(0, 8)}...{sharedBy?.substring(36)}</p>
            </div>
            <div className="bg-dark-900/80 rounded-xl p-4">
              <p className="text-slate-500 text-xs mb-1">Uploaded</p>
              <p className="text-white text-xs">{document?.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="bg-dark-900/80 rounded-xl p-4">
              <p className="text-slate-500 text-xs mb-1">Type</p>
              <p className="text-white text-xs">{document?.documentType}</p>
            </div>
          </div>

          {document?.description && (
            <div className="mb-6 bg-dark-900/60 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Description</p>
              <p className="text-slate-300 text-sm">{document.description}</p>
            </div>
          )}

          {/* Status Banner */}
          {isRevoked ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center">
              <FiAlertCircle className="text-red-400 text-2xl mx-auto mb-2" />
              <p className="text-red-400 font-bold">This Document Has Been Revoked</p>
              <p className="text-sm text-slate-500 mt-1">The document owner has revoked access to this document.</p>
            </div>
          ) : (
            <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-5 text-center">
              <FiShield className="text-brand-400 text-2xl mx-auto mb-2" />
              <p className="text-brand-400 font-bold">Document Verified & Authentic</p>
              <p className="text-sm text-slate-500 mt-1">This document is authentic and has not been tampered with.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-600 mb-4 text-sm">Want to secure your own documents?</p>
          <Link to="/" className="btn-accent inline-flex items-center gap-2">
            <FiHome size={16} /> Get Started with DocZ+
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedDocument;
