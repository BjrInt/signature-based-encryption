import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { ExpiringLSItemType, StoredKeypairType } from "../utils/types";
import { getExpiringLS } from "../utils/factories";
import { KEYPAIR_VALIDITY } from "../utils/constants";

const getKeyPair = async () => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );
  return keyPair;
};

export function useKeypair() {
  const [cryptoErr, setCryptoErr] = useState<boolean | null>(null);
  const [isFresh, setIsFresh] = useState<boolean | null>(null);
  const [keypair, setKeypair] =
    useLocalStorage<ExpiringLSItemType<StoredKeypairType> | null>(
      "keypair",
      null
    );

  useEffect(() => {
    if (!keypair || keypair.createdAt + KEYPAIR_VALIDITY < Date.now()) {
      const initKP = async () => {
        try {
          const kp = await getKeyPair();
          const publicKey = await crypto.subtle.exportKey("jwk", kp.publicKey);
          const privateKey = await crypto.subtle.exportKey(
            "jwk",
            kp.privateKey
          );
          setIsFresh(true);
          setCryptoErr(false);
          setKeypair(getExpiringLS({ publicKey, privateKey }));
        } catch (err) {
          console.error(err);
          setCryptoErr(true);
        }
      };

      initKP();
    } else {
      setIsFresh(false);
    }
  }, []);

  return { cryptoErr, keypair, isFresh };
}
