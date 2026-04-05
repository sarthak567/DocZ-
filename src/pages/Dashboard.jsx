import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { documentAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiSearch, FiGrid, FiList, FiPlus, FiFile, FiClock, FiCheckCircle,
  FiXCircle, FiShare2, FiEye, FiTrash2, FiMoreVertical,
  FiShield, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { formatFileSize } from '../utils/hash';
import { formatAddress, formatTxHash, getExplorerUrl } from '../services/blockchain';

const Dashboard = () => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, revoked: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [menuOpen, setMenuOpen] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(activeTab === 'shared' && { shared: 'true' }),
      };

      const [docRes, statsRes] = await Promise.all([
        documentAPI.getAll(params),
        documentAPI.getStats(),
      ]);

      setDocuments(docRes.documents);
      setPagination(docRes.pagination);
      setStats(statsRes.stats);
    } catch {
      toast.error('Failed to load documents. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, activeTab]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this document permanently?')) return;
    try {
      await documentAPI.delete(id);
      toast.success('Document deleted');
      fetchDocuments();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'verified':
        return <span className="badge-verified"><FiCheckCircle size={10} /> Verified</span>;
      case 'pending':
        return <span className="badge-pending"><FiClock size={10} /> Pending</span>;
      case 'revoked':
        return <span className="badge-revoked"><FiXCircle size={10} /> Revoked</span>;
      default:
        return <span className="badge-unknown">{status}</span>;
    }
  };

  const SkeletonCard = () => (
    <div className="card p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-dark-700 rounded-xl"></div>
        <div className="w-6 h-6 bg-dark-700 rounded-lg"></div>
      </div>
      <div className="h-5 bg-dark-700 rounded-lg mb-3 w-3/4"></div>
      <div className="h-4 bg-dark-700 rounded-lg mb-3 w-1/2"></div>
      <div className="space-y-2 mt-4">
        <div className="h-3 bg-dark-700 rounded w-full"></div>
        <div className="h-3 bg-dark-700 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Documents</h1>
            <p className="text-slate-500 text-sm">Manage and track all your blockchain-secured documents</p>
          </div>
          <Link to="/upload" className="btn-accent flex items-center gap-2 text-sm px-5 py-2.5 w-fit">
            <FiPlus size={16} />
            Upload New
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: FiFile, color: 'text-slate-400', bg: 'bg-dark-700/30' },
            { label: 'Verified', value: stats.verified, icon: FiCheckCircle, color: 'text-brand-400', bg: 'bg-brand-500/10' },
            { label: 'Pending', value: stats.pending, icon: FiClock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Revoked', value: stats.revoked, icon: FiXCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map((stat, idx) => (
            <div key={idx} className="card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`${stat.color}`} size={18} />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-1 bg-dark-800/80 rounded-xl p-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'mine', label: 'Mine' },
                { key: 'shared', label: 'Shared' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-brand-500 text-black font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search + Controls */}
            <div className="flex gap-2 items-center w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="input-field pl-10 text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="input-field w-32 text-sm"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="revoked">Revoked</option>
              </select>

              <div className="flex bg-dark-800/80 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-dark-600 text-brand-400' : 'text-slate-500'}`}
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-dark-600 text-brand-400' : 'text-slate-500'}`}
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-20 h-20 mx-auto bg-dark-700/50 rounded-2xl flex items-center justify-center mb-6">
              <FiShield size={32} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Documents Found</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              {search ? 'Try a different search term or clear filters.' : 'Upload your first document to get started with blockchain verification.'}
            </p>
            <Link to="/upload" className="btn-accent inline-flex items-center gap-2">
              <FiPlus size={16} />
              Upload Document
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc, idx) => (
              <div key={doc.id} className="card-glow p-5 group animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                {/* Top Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                    <FiFile className="text-brand-400" size={22} />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === doc.id ? null : doc.id)}
                      className="btn-icon"
                    >
                      <FiMoreVertical size={16} />
                    </button>
                    {menuOpen === doc.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-dark-800 rounded-xl border border-dark-600 shadow-2xl z-10 overflow-hidden animate-fade-in">
                        <Link to={`/documents/${doc.id}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-700/50 transition-colors">
                          <FiEye size={14} /> View Details
                        </Link>
                        <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-700/50 transition-colors">
                          <FiShare2 size={14} /> Share
                        </button>
                        <div className="border-t border-dark-700/50"></div>
                        <button onClick={() => { handleDelete(doc.id); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                          <FiTrash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-white mb-2 truncate">{doc.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <StatusBadge status={doc.status} />
                  <span className="text-xs text-slate-600">{doc.documentTypeName}</span>
                </div>

                {/* Meta */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span className="text-xs">Size</span>
                    <span className="text-xs text-slate-400">{formatFileSize(doc.size)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span className="text-xs">Uploaded</span>
                    <span className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* TX Link */}
                {doc.blockchainTxHash && (
                  <a
                    href={getExplorerUrl(doc.blockchainTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3 pt-3 border-t border-dark-700/50 text-xs text-brand-500 hover:text-brand-400 font-mono truncate transition-colors"
                  >
                    {formatTxHash(doc.blockchainTxHash)} ↗
                  </a>
                )}

                {/* Action */}
                <Link
                  to={`/documents/${doc.id}`}
                  className="mt-4 w-full btn-secondary text-xs flex items-center justify-center gap-1.5 py-2"
                >
                  <FiEye size={13} /> View
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-800/50">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">TX</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/40">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-dark-700/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiFile className="text-brand-400" size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white truncate max-w-[180px]">{doc.title}</p>
                          <p className="text-xs text-slate-600 font-mono truncate max-w-[180px]">{doc.documentHash?.substring(0, 16)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-400">{doc.documentTypeName}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={doc.status} /></td>
                    <td className="px-4 py-3.5 text-sm text-slate-400">{formatFileSize(doc.size)}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      {doc.blockchainTxHash && (
                        <a href={getExplorerUrl(doc.blockchainTxHash)} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:text-brand-400 font-mono">
                          {formatTxHash(doc.blockchainTxHash)} ↗
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link to={`/documents/${doc.id}`} className="btn-icon"><FiEye size={14} /></Link>
                        <button onClick={() => handleDelete(doc.id)} className="btn-icon text-red-400"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-secondary px-3 py-2 text-sm disabled:opacity-30"
            >
              <FiChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                      page === pageNum
                        ? 'bg-brand-500 text-black font-bold'
                        : 'bg-dark-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="btn-secondary px-3 py-2 text-sm disabled:opacity-30"
            >
              <FiChevronRight size={16} />
            </button>
            <span className="text-xs text-slate-600 ml-2">
              Page {pagination.page} of {pagination.pages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
