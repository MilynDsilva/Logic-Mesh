import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const MASTER_KEY = process.env.CREDENTIAL_MASTER_KEY || 'logicmesh_master_key_32bytes_sec!'; // 32 chars

export function encryptAES256(text: string): { encryptedData: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(MASTER_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

export function decryptAES256(encryptedData: string, ivHex: string, tagHex: string): string {
  try {
    const key = crypto.scryptSync(MASTER_KEY, 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return encryptedData;
  }
}
