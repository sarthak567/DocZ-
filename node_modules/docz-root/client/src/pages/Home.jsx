import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiLock, FiCheckCircle, FiGlobe, FiUpload, FiDatabase, FiSearch, FiShare2, FiTrendingUp, FiArrowRight, FiZap, FiCheck } from 'react-icons/fi';
import { formatAddress } from '../services/blockchain';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated, walletAddress, connect, isMetaMaskInstalled, isCorrectNetwork, switchNetwork } = useAuth();
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it from metamask.io');
      return;
    }
    await connect();
  };

  const features = [
    {
      icon: FiShield,
      title: 'Military-Grade Security',
      desc: 'Your documents are encrypted, hashed, and stored across a decentralized network. Tamper-proof and immutable.',
      color: 'from-brand-400 to-brand-600',
      glow: 'shadow-brand-500/20',
    },
    {
      icon: FiLock,
      title: 'Tamper Detection',
      desc: 'SHA-256 hashing ensures any modification to your documents is instantly detectable.',
      color: 'from-purple-400 to-purple-600',
      glow: 'shadow-purple-500/20',
    },
    {
      icon: FiZap,
      title: 'Instant Verification',
      desc: 'Verify any document in seconds via blockchain. No delays, no middlemen.',
      color: 'from-amber-400 to-amber-600',
      glow: 'shadow-amber-500/20',
    },
    {
      icon: FiGlobe,
      title: 'Global Access',
      desc: 'Share documents worldwide with QR codes and time-limited links. Controlled access, always.',
      color: 'from-cyan-400 to-cyan-600',
      glow: 'shadow-cyan-500/20',
    },
    {
      icon: FiDatabase,
      title: 'IPFS Storage',
      desc: 'Documents stored on IPFS with Pinata pinning. Decentralized, redundant, and permanent.',
      color: 'from-pink-400 to-pink-600',
      glow: 'shadow-pink-500/20',
    },
    {
      icon: FiShare2,
      title: 'Smart Access Control',
      desc: 'Grant view, verify, or full access to lawyers, authorities, or anyone you trust.',
      color: 'from-indigo-400 to-indigo-600',
      glow: 'shadow-indigo-500/20',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Upload & Hash',
      desc: 'Drop your document. SHA-256 hash is computed locally in your browser — your file never leaves your device unprotected.',
      icon: FiUpload,
      color: 'brand',
    },
    {
      num: '02',
      title: 'Pin to IPFS + Blockchain',
      desc: 'File is stored on IPFS. Hash is anchored on Polygon — creating an immutable, timestamped proof of existence.',
      icon: FiDatabase,
      color: 'brand',
    },
    {
      num: '03',
      title: 'Verify Anywhere',
      desc: 'Anyone can verify authenticity in seconds by uploading the file or entering the hash. Results are cryptographically provable.',
      icon: FiCheckCircle,
      color: 'brand',
    },
  ];

  const stats = [
    { value: '50,000+', label: 'Documents Secured' },
    { value: '120,000+', label: 'Verifications' },
    { value: '15,000+', label: 'Active Users' },
    { value: '12', label: 'Countries' },
  ];

  return (
    <div className="min-h-screen pt-16 overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[5%] w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-brand-400/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/[0.02] rounded-full blur-[80px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-brand-400 font-medium">Powered by Polygon Blockchain · Amoy Network</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center max-w-5xl mx-auto mb-8 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.05]">
              <span className="gradient-text-bright">Secure.</span>
              <br />
              <span className="text-white">Verify.</span>
              <br />
              <span className="gradient-text">Trust.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The blockchain-powered document verification platform. Upload, hash, store on IPFS, anchor on Polygon — verify anywhere in seconds.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {isAuthenticated ? (
              <>
                <Link to="/upload" className="btn-accent text-base px-8 py-4 flex items-center gap-2">
                  <FiUpload size={18} />
                  Upload Document
                  <FiArrowRight size={16} />
                </Link>
                <Link to="/dashboard" className="btn-secondary text-base px-8 py-4">
                  View Dashboard
                </Link>
              </>
            ) : (
              <>
                <button onClick={handleConnect} className="btn-accent text-base px-8 py-4 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 35 33" fill="none">
                    <path d="M32.9582 1L19.4641 11.0333L22.4989 5.07533L32.9582 1Z" fill="#E17726"/>
                    <path d="M2.04224 1L15.5364 11.0333L12.5015 5.07533L2.04224 1Z" fill="#E27625"/>
                    <path d="M28.1954 23.5336L24.3649 28.8213L32.3458 30.9325L34.4328 23.1786L28.1954 23.5336Z" fill="#E27625"/>
                    <path d="M0.567383 23.1786L2.65433 30.9325L10.6353 28.8213L6.80482 23.5336L0.567383 23.1786Z" fill="#E27625"/>
                    <path d="M10.0177 13.3478L7.90564 16.0344L15.3493 16.5775L14.9495 8.26075L10.0177 13.3478Z" fill="#E27625"/>
                    <path d="M24.9827 13.3478L19.9992 8.21467L20.6509 16.5775L28.0945 16.0344L24.9827 13.3478Z" fill="#E27625"/>
                    <path d="M10.6353 28.8213L15.2984 26.9033L11.0475 23.5336L10.6353 28.8213Z" fill="#E27625"/>
                    <path d="M19.7019 26.9033L24.3649 28.8213L23.9528 23.5336L19.7019 26.9033Z" fill="#E27625"/>
                  </svg>
                  Connect Wallet
                </button>
                <Link to="/verify" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
                  <FiSearch size={16} />
                  Verify Document
                </Link>
              </>
            )}
          </div>

          {/* Wallet Status */}
          {isAuthenticated && walletAddress && (
            <div className="flex justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800/80 border border-dark-700 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-brand-400' : 'bg-amber-400'}`}></div>
                <span className="text-sm text-slate-400 font-mono">{formatAddress(walletAddress)}</span>
                {!isCorrectNetwork && (
                  <button onClick={switchNetwork} className="text-xs text-amber-400 hover:text-amber-300 ml-1 transition-colors">
                    Switch to Polygon →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className={`relative py-16 transition-all duration-1000 ${statsVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="text-3xl md:text-4xl font-black gradient-text-bright mb-1 group-hover:scale-105 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full mb-4">
              <FiCheckCircle size={12} className="text-brand-400" />
              <span className="text-xs text-brand-400 font-medium">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Three steps to document immortality on the blockchain.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[3.5rem] left-[20%] right-[20%] h-px bg-gradient-to-r from-brand-500/30 via-brand-500/60 to-brand-500/30"></div>

            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="card-glow p-8 text-center h-full">
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-500/20 to-brand-600/20 rounded-2xl flex items-center justify-center border border-brand-500/20">
                      <step.icon size={28} className="text-brand-400" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-xs font-black text-black shadow-lg shadow-brand-500/30">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Built for the Real World</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Every feature designed for legal professionals, citizens, and authorities.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="card-glow p-6 group hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLES ─── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Built for Everyone</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Tailored workflows for citizens, lawyers, and government authorities.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Citizens',
                desc: 'Store and share your important documents securely. Issue time-limited verification links.',
                icon: '👤',
                color: 'brand',
                items: ['Document upload & hashing', 'QR code sharing', 'Access control'],
              },
              {
                title: 'Lawyers',
                desc: 'Verify client documents instantly. Access shared files with proper permissions.',
                icon: '⚖️',
                color: 'purple',
                items: ['Instant verification', 'Role-based access', 'Audit trails'],
              },
              {
                title: 'Authorities',
                desc: 'Approve documents and add official records. Full verification and revocation capabilities.',
                icon: '🏛️',
                color: 'amber',
                items: ['Document approval', 'Full revocation', 'Multi-doc verification'],
              },
            ].map((role, idx) => (
              <div key={idx} className={`card-glow p-8 ${idx === 1 ? 'border-purple-500/20' : idx === 2 ? 'border-amber-500/20' : ''}`}>
                <div className="text-4xl mb-4">{role.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                <p className="text-sm text-slate-400 mb-5">{role.desc}</p>
                <ul className="space-y-2">
                  {role.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <FiCheck size={14} className="text-brand-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/20 via-transparent to-brand-900/20 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to go{' '}
            <span className="gradient-text-bright">on-chain</span>?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of users who trust DocZ+ for their legal document management.
          </p>
          {isAuthenticated ? (
            <Link to="/upload" className="btn-accent text-lg px-10 py-4 inline-flex items-center gap-2">
              <FiUpload size={18} />
              Upload Your First Document
              <FiArrowRight size={16} />
            </Link>
          ) : (
            <button onClick={handleConnect} className="btn-accent text-lg px-10 py-4 inline-flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 35 33" fill="none">
                <path d="M32.9582 1L19.4641 11.0333L22.4989 5.07533L32.9582 1Z" fill="#E17726"/>
                <path d="M2.04224 1L15.5364 11.0333L12.5015 5.07533L2.04224 1Z" fill="#E27625"/>
                <path d="M28.1954 23.5336L24.3649 28.8213L32.3458 30.9325L34.4328 23.1786L28.1954 23.5336Z" fill="#E27625"/>
                <path d="M0.567383 23.1786L2.65433 30.9325L10.6353 28.8213L6.80482 23.5336L0.567383 23.1786Z" fill="#E27625"/>
                <path d="M10.0177 13.3478L7.90564 16.0344L15.3493 16.5775L14.9495 8.26075L10.0177 13.3478Z" fill="#E27625"/>
                <path d="M24.9827 13.3478L19.9992 8.21467L20.6509 16.5775L28.0945 16.0344L24.9827 13.3478Z" fill="#E27625"/>
                <path d="M10.6353 28.8213L15.2984 26.9033L11.0475 23.5336L10.6353 28.8213Z" fill="#E27625"/>
                <path d="M19.7019 26.9033L24.3649 28.8213L23.9528 23.5336L19.7019 26.9033Z" fill="#E27625"/>
              </svg>
              Connect Wallet — It's Free
            </button>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 border-t border-dark-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                <span className="text-white font-black text-xs">D+</span>
              </div>
              <span className="font-bold gradient-text">DocZ+</span>
            </div>
            <p className="text-sm text-slate-600">
              © 2024 DocZ+. Built on Polygon Blockchain · Amoy Testnet.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
