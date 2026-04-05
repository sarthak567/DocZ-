import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const POLYGON_RPC = import.meta.env.VITE_POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';
const CHAIN_ID = 80002;

export const checkMetaMask = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

export const connectWallet = async () => {
  if (!checkMetaMask()) {
    throw new Error('MetaMask not installed. Please install MetaMask extension.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }

    return accounts[0];
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('Connection rejected. Please approve the MetaMask request.');
    }
    throw error;
  }
};

export const getCurrentAccount = async () => {
  if (!checkMetaMask()) return null;

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
};

export const switchToPolygon = async () => {
  if (!checkMetaMask()) {
    throw new Error('MetaMask not installed');
  }

  try {
    // Try to switch to Polygon Amoy
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
    });
  } catch (switchError) {
    // Chain not added, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${CHAIN_ID.toString(16)}`,
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: [POLYGON_RPC],
              blockExplorerUrls: ['https://www.oklink.com/amoy'],
            },
          ],
        });
      } catch (addError) {
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
};

export const getProvider = () => {
  if (!checkMetaMask()) return null;
  try {
    return new ethers.BrowserProvider(window.ethereum);
  } catch {
    return null;
  }
};

export const getSigner = async () => {
  const provider = getProvider();
  if (!provider) return null;
  try {
    return await provider.getSigner();
  } catch {
    return null;
  }
};

export const signMessage = async (message) => {
  if (!checkMetaMask()) {
    throw new Error('MetaMask not connected');
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No account connected');
    }

    // Use personal_sign for better compatibility
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, accounts[0]],
    });

    return signature;
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('Signature rejected by user');
    }
    throw error;
  }
};

export const verifySignature = (message, signature, address) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch {
    return false;
  }
};

export const getNetworkInfo = async () => {
  if (!checkMetaMask()) return null;

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return {
      chainId: parseInt(chainId, 16),
      name: getNetworkName(parseInt(chainId, 16)),
      isCorrectNetwork: parseInt(chainId, 16) === CHAIN_ID
    };
  } catch {
    return null;
  }
};

const getNetworkName = (chainId) => {
  const networks = {
    1: 'Ethereum Mainnet',
    137: 'Polygon Mainnet',
    80002: 'Polygon Amoy',
    11155111: 'Sepolia Testnet',
  };
  return networks[chainId] || 'Unknown Network';
};

export const listenForAccountChanges = (callback) => {
  if (!checkMetaMask()) return () => {};

  const handleAccountsChanged = (accounts) => {
    callback(accounts.length > 0 ? accounts[0] : null);
  };

  const handleChainChanged = () => {
    // Recommend reloading
    window.location.reload();
  };

  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);

  return () => {
    if (window.ethereum?.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };
};

export const getBalance = async (address) => {
  if (!checkMetaMask()) return null;

  try {
    const provider = getProvider();
    if (!provider) return null;
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch {
    return null;
  }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const formatTxHash = (hash) => {
  if (!hash) return '';
  if (hash.startsWith('0xsim_')) return hash.substring(0, 20) + '...';
  return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
};

export const EXPLORER_URL = 'https://www.oklink.com/amoy';

export const getExplorerUrl = (txHash) => {
  if (!txHash) return '#';
  if (txHash.startsWith('0xsim_')) return '#';
  return `${EXPLORER_URL}/tx/${txHash}`;
};
