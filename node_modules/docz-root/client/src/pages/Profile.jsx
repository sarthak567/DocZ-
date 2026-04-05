import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiGlobe, FiSave, FiCopy, FiShield, FiZap, FiExternalLink } from 'react-icons/fi';
import { formatAddress, getExplorerUrl } from '../services/blockchain';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, walletAddress } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', language: 'en' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { user: userData } = await authAPI.getProfile();
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        language: userData.language || i18n.language,
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(formData);
      i18n.changeLanguage(formData.language);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ];

  const roles = { citizen: 'Citizen', lawyer: 'Lawyer', authority: 'Authority', admin: 'Admin' };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-8">Profile Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Wallet */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <FiShield size={16} className="text-brand-400" /> Wallet Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-brand-400 font-mono bg-dark-900/80 p-3 rounded-xl break-all">{walletAddress}</code>
                  <button type="button" onClick={() => copyToClipboard(walletAddress)} className="btn-icon"><FiCopy size={15} /></button>
                  <a href={getExplorerUrl(walletAddress)} target="_blank" rel="noopener noreferrer" className="btn-icon"><FiExternalLink size={15} /></a>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Role</p>
                  <div className="bg-dark-900/80 p-3 rounded-xl">
                    <span className="text-white font-semibold text-sm">{roles[user?.role] || 'Citizen'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Wallet Type</p>
                  <div className="bg-dark-900/80 p-3 rounded-xl">
                    <span className="text-white font-semibold text-sm flex items-center gap-1.5"><FiZap size={12} className="text-amber-400" /> MetaMask</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-white mb-4">Profile Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91..." className="input-field" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Language</label>
                <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="input-field">
                  {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-accent w-full flex items-center justify-center gap-2 py-3.5">
            {saving ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div> Saving...</>
            ) : (
              <><FiSave size={16} /> Save Changes</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
