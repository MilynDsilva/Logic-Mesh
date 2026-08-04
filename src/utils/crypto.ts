/**
 * AES-256-GCM simulation helper for client-side encrypted credentials
 */
export function encryptSecret(plainText: string): { encrypted: string; iv: string } {
  try {
    const b64 = btoa(plainText);
    const iv = Math.random().toString(36).substring(2, 10);
    const encrypted = `enc_${iv}_${b64}`;
    return { encrypted, iv };
  } catch {
    return { encrypted: plainText, iv: 'raw' };
  }
}

export function decryptSecret(encryptedStr: string): string {
  try {
    if (encryptedStr.startsWith('enc_')) {
      const parts = encryptedStr.split('_');
      const b64 = parts.slice(2).join('_');
      return atob(b64);
    }
    return encryptedStr;
  } catch {
    return encryptedStr;
  }
}
