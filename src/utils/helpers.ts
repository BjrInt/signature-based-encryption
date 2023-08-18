import { Buffer } from "buffer";

import { createUIError } from "./factories";

const PAYLOAD_TO_SIGN = "The quick brown fox jumps over the lazy dog";

const getSha256 = async (payload: string) => {
  const msgBuffer = new TextEncoder().encode(payload);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
  return hashBuffer;
};

export const getKeypair = async (account: string) => {
  try {
    const msg = `0x${Buffer.from(PAYLOAD_TO_SIGN).toString("hex")}`;
    const sign = await window.ethereum.request({
      method: "personal_sign",
      params: [msg, account],
    });

    const rawPKey = await getSha256(sign);
    const pkey = await window.crypto.subtle.importKey(
      "raw",
      rawPKey,
      {
        name: "AES-CTR",
        hash: "SHA-256",
      },
      false,
      ["encrypt", "decrypt"]
    );

    return pkey;
  } catch (err: Error | any) {
    console.error(err);
    return createUIError(
      "Error generating the key",
      err.message || err.toString()
    );
  }
};

export const encrypt = async (pkey: CryptoKey, data: string) => {
  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-CTR",
        counter: iv,
        length: 128,
      },
      pkey,
      new TextEncoder().encode(data)
    );

    const encryptedBuffer = new Uint8Array(encrypted);
    const encryptedHex = Buffer.from(encryptedBuffer).toString("hex");
    const ivHex = Buffer.from(iv).toString("hex");

    return `${ivHex}:${encryptedHex}`;
  } catch (err: Error | any) {
    console.error(err);
    return createUIError(
      "Error encrypting the data",
      err.message || err.toString()
    );
  }
};

export const decrypt = async (pkey: CryptoKey, data: string) => {
  try {
    const [ivHex, encryptedHex] = data.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-CTR",
        counter: iv,
        length: 128,
      },
      pkey,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (err: Error | any) {
    console.error(err);
    return createUIError(
      "Error decrypting the data",
      err.message || err.toString()
    );
  }
};
