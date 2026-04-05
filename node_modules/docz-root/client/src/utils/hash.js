const generateHash = async (file) => {
  const buffer = await file.arrayBuffer();
  const wordArray = await crypto.subtle.digest(
    { name: 'SHA-256' },
    buffer
  );
  const hashArray = Array.from(new Uint8Array(wordArray));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const generateHashFromBuffer = async (buffer) => {
  const wordArray = await crypto.subtle.digest(
    { name: 'SHA-256' },
    buffer
  );
  const hashArray = Array.from(new Uint8Array(wordArray));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const generateHashFromString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const wordArray = await crypto.subtle.digest({ name: 'SHA-256' }, data);
  const hashArray = Array.from(new Uint8Array(wordArray));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const truncateHash = (hash, startChars = 6, endChars = 4) => {
  if (!hash) return '';
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
};

export { generateHash, generateHashFromBuffer, generateHashFromString, formatFileSize, truncateHash };
