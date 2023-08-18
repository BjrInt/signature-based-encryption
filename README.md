# Signature Based Encryption

This repository is a simple proof of concept of generating an AES CryptoKey using an EIP-712 signed payload, to encrypt data without having to store the privateKey.

The underlying idea is that ECDSA signatures are deterministic but unpredictable making it a convenient way to generate key.

## Workflow

- "Log in" using Metamask or any other compatible wallet
- Press the <kbd>Generate Encryption Keypair</kbd> button. This will sign a defined constant payload (set in [./src/helpers.ts](helpers.ts)).
- The signed Buffer will then be hashed, using sha-256, generating a 256-bit digest.
- The sha-256 digest is used as a raw input AES private key.
- You can now encrypt/decrypt using your key

It is easy to further build upon that project to export the associated publicKey and use it as a generic file encryptor.

## Disclaimer

**This project is provided as is, without any warranty or security liability. Use it at your own risk.**
