import CryptoJS from 'crypto-js';

/**
 * Encrypts a file's content using a secret key.
 * @param fileContent The file content as a string or ArrayBuffer.
 * @param secretKey The secret key for encryption.
 * @returns The encrypted content as a string.
 */
export const encryptFile = (fileContent: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(fileContent, secretKey).toString();
};

/**
 * Decrypts encrypted content using a secret key.
 * @param encryptedContent The encrypted content as a string.
 * @param secretKey The secret key for decryption.
 * @returns The decrypted content as a string.
 */
export const decryptFile = (encryptedContent: string, secretKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedContent, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Converts a file to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Generates a random encryption key.
 */
export const generateKey = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
