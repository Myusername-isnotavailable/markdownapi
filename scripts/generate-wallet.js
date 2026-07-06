const bitcoin = require('bitcoinjs-lib');
const ecc = require('@bitcoinerlab/secp256k1');
bitcoin.initEccLib(ecc);

const bip32Factory = require('bip32');
const ecc2 = require('@bitcoinerlab/secp256k1');
const bip32 = bip32Factory.BIP32Factory(ecc2);
const bip39 = require('bip39');

const mnemonic = bip39.generateMnemonic();
const seed = bip39.mnemonicToSeedSync(mnemonic);
const root = bip32.fromSeed(seed);
const child = root.derivePath("m/44'/0'/0'/0/0");
const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey });

console.log('=== SAVE THESE SECURELY ===');
console.log('Mnemonic:', mnemonic);
console.log('BTC Address:', address);
console.log('Private Key (WIF):', child.toWIF());
