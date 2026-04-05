import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import {
  checkMetaMask,
  connectWallet,
  getCurrentAccount,
  switchToPolygon,
  getNetworkInfo,
  listenForAccountChanges,
  signMessage,
} from '../services/blockchain';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const checkWallet = async () => {
      const installed = checkMetaMask();
      setIsMetaMaskInstalled(installed);

      if (installed) {
        try {
          const account = await getCurrentAccount();
          if (account) {
            const networkInfo = await getNetworkInfo();
            setIsCorrectNetwork(networkInfo?.isCorrectNetwork || false);
            setWalletAddress(account);

            try {
              const token = Cookies.get('docz_token');
              if (token) {
                const { user: userData } = await authAPI.getProfile();
                setUser(userData);
              }
            } catch (error) {
              Cookies.remove('docz_token');
            }
          }
        } catch (error) {
          console.warn('Wallet check error:', error);
        }
      }
      setIsLoading(false);
    };

    checkWallet();

    if (checkMetaMask()) {
      const cleanup = listenForAccountChanges(async (account) => {
        if (!account) {
          setWalletAddress(null);
          setUser(null);
          setIsCorrectNetwork(false);
          Cookies.remove('docz_token');
        } else {
          setWalletAddress(account);
          try {
            const networkInfo = await getNetworkInfo();
            setIsCorrectNetwork(networkInfo?.isCorrectNetwork || false);

            const token = Cookies.get('docz_token');
            if (token) {
              const { user: userData } = await authAPI.getProfile();
              setUser(userData);
            }
          } catch {
            Cookies.remove('docz_token');
          }
        }
      });

      return cleanup;
    }
  }, []);

  const handleConnect = useCallback(async () => {
    setConnectionError(null);

    if (!checkMetaMask()) {
      toast.error('MetaMask not found. Please install MetaMask extension.');
      return;
    }

    try {
      // First, request accounts (this triggers MetaMask popup)
      const account = await connectWallet();
      setWalletAddress(account);

      // Try to switch to Polygon network
      try {
        await switchToPolygon();
        setIsCorrectNetwork(true);
      } catch (networkError) {
        console.warn('Network switch error (continuing anyway):', networkError);
        // Don't block connection for network switch failure
      }

      // Generate message for signing
      const message = `Welcome to DocZ+

Sign this message to authenticate with your wallet.

Wallet Address: ${account}
Timestamp: ${Date.now()}`;

      // Sign the message
      let signature;
      try {
        signature = await signMessage(message);
      } catch (signError) {
        // If signing is rejected, we can still login with wallet address only
        console.warn('Signing rejected:', signError);
        signature = null;
      }

      // Login to backend
      try {
        const { user: userData, token } = await authAPI.login(account, signature, message);
        Cookies.set('docz_token', token, { expires: 30 });
        setUser(userData);
        toast.success(`Wallet connected: ${account.substring(0, 6)}...${account.substring(38)}`);
      } catch (loginError) {
        console.error('Backend login error:', loginError);
        toast.error('Failed to login. Please try again.');
      }

    } catch (error) {
      console.error('Connection error:', error);
      const errorMessage = error.message || 'Failed to connect wallet';

      if (errorMessage.includes('User rejected') || errorMessage.includes('rejected')) {
        toast.error('Connection rejected. Please approve the MetaMask request.');
      } else if (errorMessage.includes('Already processing')) {
        toast.error('MetaMask is already open. Please check your browser.');
      } else {
        toast.error(errorMessage);
      }
      setConnectionError(errorMessage);
    }
  }, []);

  const handleSwitchNetwork = useCallback(async () => {
    try {
      await switchToPolygon();
      setIsCorrectNetwork(true);
      toast.success('Switched to Polygon Amoy network');
    } catch (error) {
      toast.error('Failed to switch network. Please switch manually in MetaMask.');
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    setWalletAddress(null);
    setUser(null);
    setNotifications([]);
    setIsCorrectNetwork(false);
    setConnectionError(null);
    Cookies.remove('docz_token');
    toast.success('Wallet disconnected');
  }, []);

  const loginWithBackend = useCallback(async (address) => {
    try {
      const message = `Welcome to DocZ+

Sign to authenticate.

Wallet: ${address}
Time: ${Date.now()}`;
      const signature = await signMessage(message);
      const { user: userData, token } = await authAPI.login(address, signature, message);
      Cookies.set('docz_token', token, { expires: 30 });
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Backend login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    Cookies.remove('docz_token');
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    user,
    walletAddress,
    isLoading,
    isMetaMaskInstalled,
    isCorrectNetwork,
    isAuthenticated: !!walletAddress && !!user,
    notifications,
    connectionError,
    connect: handleConnect,
    switchNetwork: handleSwitchNetwork,
    disconnect: handleDisconnect,
    loginWithBackend,
    logout,
    clearNotification,
    clearAllNotifications,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
