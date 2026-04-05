import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="text-center">
        <div className="relative inline-flex mb-8">
          <div className="w-28 h-28 bg-dark-800 rounded-2xl flex items-center justify-center border border-dark-700">
            <FiAlertTriangle className="text-slate-600 text-5xl" />
          </div>
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-dark-700 rounded-xl flex items-center justify-center border border-dark-600">
            <span className="text-2xl font-black text-slate-500">?</span>
          </div>
        </div>

        <h1 className="text-7xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link to="/" className="btn-accent inline-flex items-center gap-2 px-8 py-3">
          <FiHome size={18} />
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
