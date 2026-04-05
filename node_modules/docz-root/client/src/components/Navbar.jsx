import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { formatAddress, getExplorerUrl } from '../services/blockchain';
import { FiMenu, FiX, FiGrid, FiUpload, FiCheckCircle, FiUser, FiLogOut, FiBell, FiGlobe, FiChevronDown, FiExternalLink, FiZap } from 'react-icons/fi';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, walletAddress, isAuthenticated, isCorrectNetwork, notifications, disconnect, switchNetwork, connect } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const location = useLocation();
  const walletMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(e.target)) setShowWalletMenu(false);
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) setShowNotifMenu(false);
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setShowLangMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code) => { i18n.changeLanguage(code); setShowLangMenu(false); };

  const navLinks = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: FiGrid },
    { to: '/upload', label: t('nav.upload'), icon: FiUpload },
    { to: '/verify', label: t('nav.verify'), icon: FiCheckCircle },
  ];

  const copyAddress = () => {
    if (walletAddress) navigator.clipboard.writeText(walletAddress);
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-dark-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity shadow-lg shadow-brand-500/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-black text-sm tracking-wider">D+</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </div>
            <span className="text-xl font-bold gradient-text tracking-tight">DocZ+</span>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-dark-700/50'
                  }`}
                >
                  <link.icon size={15} />
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifMenuRef}>
                  <button
                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                    className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-700/50 transition-all"
                  >
                    <FiBell size={20} />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    )}
                  </button>

                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl overflow-hidden animate-fade-in">
                      <div className="p-4 border-b border-dark-700/60">
                        <h3 className="font-semibold text-white text-sm">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-6 text-slate-500 text-sm text-center">No new notifications</p>
                        ) : (
                          notifications.slice(0, 10).map((notif, idx) => (
                            <div key={idx} className="p-4 border-b border-dark-700/30 hover:bg-dark-700/20 transition-colors">
                              <p className="text-sm text-slate-300">{notif.message}</p>
                              <span className="text-xs text-slate-500 mt-1 block">
                                {new Date(notif.timestamp || Date.now()).toLocaleTimeString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Language */}
                <div className="relative" ref={langMenuRef}>
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="flex items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-700/50 transition-all"
                  >
                    <FiGlobe size={18} />
                    <span className="text-xs font-semibold">{currentLang.code.toUpperCase()}</span>
                  </button>

                  {showLangMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-dark-800 rounded-xl border border-dark-600 shadow-2xl overflow-hidden animate-fade-in">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-dark-700/50 transition-colors ${
                            i18n.language === lang.code ? 'text-brand-400' : 'text-slate-300'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Wallet */}
                <div className="relative" ref={walletMenuRef}>
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-xl border border-dark-600 hover:border-brand-500/30 transition-all"
                  >
                    <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-brand-400 shadow-lg shadow-brand-400/50' : 'bg-amber-400'}`}></div>
                    <span className="text-sm font-mono text-white">{formatAddress(walletAddress)}</span>
                    <FiChevronDown size={14} className={`text-slate-400 transition-transform ${showWalletMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showWalletMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl overflow-hidden animate-fade-in">
                      <div className="p-4 border-b border-dark-700/60">
                        <p className="text-xs text-slate-500 mb-1">Connected Wallet</p>
                        <p className="text-sm font-mono text-brand-400 break-all leading-relaxed">{walletAddress}</p>
                      </div>

                      <div className="p-2">
                        {!isCorrectNetwork && (
                          <button
                            onClick={() => { switchNetwork(); setShowWalletMenu(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-amber-400 hover:bg-dark-700/40 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <FiZap size={14} />
                            Switch to Polygon
                          </button>
                        )}

                        <button
                          onClick={() => { copyAddress(); setShowWalletMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-700/40 rounded-lg transition-colors"
                        >
                          Copy Address
                        </button>

                        <a
                          href={getExplorerUrl(walletAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowWalletMenu(false)}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-700/40 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          View on Explorer
                          <FiExternalLink size={12} />
                        </a>

                        <Link
                          to="/profile"
                          onClick={() => setShowWalletMenu(false)}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-700/40 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <FiUser size={14} />
                          Profile
                        </Link>

                        <div className="my-1 border-t border-dark-700/40"></div>

                        <button
                          onClick={() => { disconnect(); setShowWalletMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <FiLogOut size={14} />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!isAuthenticated && (
              <button onClick={connect} className="btn-accent text-sm px-5 py-2.5">
                Connect Wallet
              </button>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-700/50 transition-all"
            >
              {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {isOpen && isAuthenticated && (
          <div className="md:hidden py-4 border-t border-dark-700/60 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? 'bg-brand-500/10 text-brand-400'
                    : 'text-slate-300 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
