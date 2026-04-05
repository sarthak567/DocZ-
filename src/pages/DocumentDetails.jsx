import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { documentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import {
  FiFile, FiCheckCircle, FiXCircle, FiClock, FiShare2,
  FiEye, FiHash, FiLink, FiLock,
  FiExternalLink, FiCopy, FiArrowLeft, FiActivity, FiShield, FiTrash
} from 'react-icons/fi';
import { formatFileSize } from '../utils/hash';
import { formatTxHash, getExplorerUrl, formatAddress } from '../services/blockchain';

const DocumentDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [shareResult, setShareResult] = useState(null);
  const [accessWallet, setAccessWallet] = useState('');
  const [accessRole, setAccessRole] = useState('view');
  const [accessExpiry, setAccessExpiry] = useState('7days');
  const [sharingAccess, setSharingAccess] = useState(false);

  useEffect(() => { fetchDocument(); }, [id]);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const { document: doc } = await documentAPI.getById(id);
      setDocument(doc);
    } catch {
      toast.error('Failed to load document');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const expiryMap = { '1day': 86400, '7days': 604800, '30days': 2592000, 'never': 0 };
    try {
      const response = await documentAPI.share(id, expiryMap[accessExpiry] || 604800);
      setShareResult(response.share);
      toast.success('Share link generated!');
    } catch { toast.error('Failed to generate share link'); }
  };

  const handleAccessGrant = async (action) => {
    if (action === 'grant' && !accessWallet.trim()) { toast.error('Enter wallet address'); return; }
    setSharingAccess(true);
    try {
      await documentAPI.manageAccess(id, {
        action,
        grantedTo: accessWallet.trim(),
        role: accessRole,
        expiresIn: accessExpiry === 'never' ? 0 : accessExpiry === '1day' ? 86400 : accessExpiry === '7days' ? 604800 : 2592000,
      });
      toast.success(action === 'grant' ? 'Access granted' : 'Access revoked');
      setAccessWallet('');
      fetchDocument();
    } catch { toast.error('Failed to manage access'); }
    finally { setSharingAccess(false); }
  };

  const handleRevoke = async () => {
    if (!confirm('Revoke this document? This cannot be undone.')) return;
    try { await documentAPI.revoke(id); toast.success('Document revoked'); fetchDocument(); }
    catch { toast.error('Failed to revoke'); }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete this document?')) return;
    try { await documentAPI.delete(id); toast.success('Document deleted'); navigate('/dashboard'); }
    catch { toast.error('Failed to delete'); }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'verified': return <span className="badge-verified"><FiCheckCircle size={10} /> Verified</span>;
      case 'pending': return <span className="badge-pending"><FiClock size={10} /> Pending</span>;
      case 'revoked': return <span className="badge-revoked"><FiXCircle size={10} /> Revoked</span>;
      default: return <span className="badge-unknown">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) return null;

  const shareUrl = shareResult ? `${window.location.origin}/verify/shared/${shareResult.linkId}` : '';

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors text-sm">
          <FiArrowLeft size={16} /> Back
        </button>

        {/* Header Card */}
        <div className="card p-6 mb-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-brand-500/15 rounded-xl flex items-center justify-center">
                <FiFile className="text-brand-400" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white mb-2">{document.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={document.status} />
                  <span className="text-sm text-slate-500">{document.documentTypeName}</span>
                  {document.isOwner && (
                    <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs">Owner</span>
                  )}
                </div>
              </div>
            </div>
            {document.isOwner && (
              <div className="flex gap-2">
                <button onClick={handleShare} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2">
                  <FiShare2 size={14} /> Share
                </button>
                <button onClick={handleRevoke} className="btn-danger flex items-center gap-2 text-sm px-4 py-2">
                  <FiXCircle size={14} /> Revoke
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
          {[
            { key: 'details', label: 'Details', icon: FiFile },
            { key: 'share', label: 'Share', icon: FiShare2 },
            { key: 'access', label: 'Access', icon: FiLock },
            { key: 'audit', label: 'Audit Log', icon: FiActivity },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'bg-brand-500 text-black font-semibold' : 'bg-dark-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { label: 'Document Hash (SHA-256)', value: document.documentHash, color: 'text-purple-400', copyable: true },
                  { label: 'IPFS Hash', value: document.ipfsHash, color: 'text-emerald-400' },
                  { label: 'Blockchain TX', value: document.blockchainTxHash, color: 'text-brand-400', copyable: true, tx: true },
                ].map(({ label, value, color, copyable, tx }) => (
                  <div key={label} className="bg-dark-900/80 rounded-xl p-4 border border-dark-700/60">
                    <p className="text-xs text-slate-500 mb-1.5">{label}</p>
                    <div className="flex items-center gap-2">
                      <code className={`flex-1 text-xs font-mono ${color} break-all leading-relaxed`}>{value}</code>
                      {copyable && <button onClick={() => copyToClipboard(value)} className="btn-icon flex-shrink-0"><FiCopy size={13} /></button>}
                      {tx && <a href={getExplorerUrl(value)} target="_blank" rel="noopener noreferrer" className="btn-icon flex-shrink-0"><FiExternalLink size={13} /></a>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  ['Type', document.documentTypeName],
                  ['Size', formatFileSize(document.size)],
                  ['Created', new Date(document.createdAt).toLocaleString()],
                  ['Owner', formatAddress(document.owner)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-3 border-b border-dark-700/40">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm text-slate-300 font-medium">{value}</span>
                  </div>
                ))}
                {document.description && (
                  <div className="pt-2">
                    <p className="text-xs text-slate-500 mb-1">Description</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{document.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SHARE TAB */}
        {activeTab === 'share' && (
          <div className="card p-6">
            <h3 className="text-lg font-bold text-white mb-5">Generate Share Link</h3>
            <div className="flex gap-3 mb-6">
              {['1day', '7days', '30days', 'never'].map((exp) => (
                <button
                  key={exp}
                  onClick={() => setAccessExpiry(exp)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    accessExpiry === exp ? 'bg-brand-500 text-black' : 'bg-dark-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {exp === '1day' ? '1 Day' : exp === '7days' ? '7 Days' : exp === '30days' ? '30 Days' : 'Never'}
                </button>
              ))}
            </div>
            <button onClick={handleShare} className="btn-accent w-full mb-6">
              <FiLink size={15} className="inline mr-2" /> Generate Share Link
            </button>

            {shareResult && (
              <div className="bg-dark-900/80 rounded-2xl p-6 border border-dark-700/60 animate-fade-in">
                <div className="flex justify-center mb-5">
                  <div className="bg-white p-4 rounded-2xl shadow-lg">
                    <QRCodeSVG value={shareUrl} size={160} level="H" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <code className="flex-1 text-xs text-brand-400 font-mono bg-dark-800 p-3 rounded-xl break-all">{shareUrl}</code>
                  <button onClick={() => copyToClipboard(shareUrl)} className="btn-icon"><FiCopy size={13} /></button>
                </div>
                <p className="text-xs text-slate-600 text-center">
                  Expires: {shareResult.expiresAt ? new Date(shareResult.expiresAt).toLocaleString() : 'Never'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ACCESS TAB */}
        {activeTab === 'access' && (
          <div className="card p-6">
            <h3 className="text-lg font-bold text-white mb-5">Access Management</h3>
            {document.isOwner && (
              <div className="bg-dark-900/80 rounded-xl p-4 mb-5 border border-dark-700/60">
                <p className="text-xs text-slate-500 mb-3 font-semibold">Grant Access</p>
                <input
                  type="text"
                  value={accessWallet}
                  onChange={(e) => setAccessWallet(e.target.value)}
                  placeholder="0x... wallet address"
                  className="input-field font-mono text-xs mb-3"
                />
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <select value={accessRole} onChange={(e) => setAccessRole(e.target.value)} className="input-field text-sm">
                    <option value="view">View Only</option>
                    <option value="verify">Verify</option>
                    <option value="full">Full Access</option>
                  </select>
                  <select value={accessExpiry} onChange={(e) => setAccessExpiry(e.target.value)} className="input-field text-sm">
                    <option value="7days">7 Days</option>
                    <option value="30days">30 Days</option>
                    <option value="never">Never</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccessGrant('grant')} disabled={sharingAccess} className="btn-accent flex-1 text-sm">
                    Grant Access
                  </button>
                  <button onClick={() => handleAccessGrant('revoke')} disabled={sharingAccess} className="btn-danger flex-1 text-sm">
                    Revoke
                  </button>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-3 font-semibold">Access List</p>
              {document.accessList?.length > 0 ? (
                <div className="space-y-2">
                  {document.accessList.map((access, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-dark-800/40 rounded-xl">
                      <div>
                        <p className="text-sm font-mono text-white">{formatAddress(access.grantedTo)}</p>
                        <p className="text-xs text-slate-500">{access.role} · {access.active ? 'Active' : 'Revoked'}</p>
                      </div>
                      <span className={`badge text-xs ${access.active ? 'badge-verified' : 'badge-unknown'}`}>
                        {access.active ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-sm text-center py-6">No access entries</p>
              )}
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="card p-6">
            <h3 className="text-lg font-bold text-white mb-5">Audit Log</h3>
            {document.auditLog?.length > 0 ? (
              <div className="space-y-3">
                {document.auditLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-dark-800/40 rounded-xl">
                    <div className="w-8 h-8 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiActivity size={14} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white capitalize">{log.action.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-600">{new Date(log.timestamp).toLocaleString()}</p>
                      {log.details && <p className="text-xs text-slate-500 mt-1">{log.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-sm text-center py-8">No audit history</p>
            )}
          </div>
        )}

        {/* Danger Zone */}
        {document.isOwner && (
          <div className="card p-6 mt-5 border border-red-500/10">
            <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-4">Permanent deletion — this action cannot be undone.</p>
            <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
              <FiTrash size={14} /> Delete Permanently
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetails;
