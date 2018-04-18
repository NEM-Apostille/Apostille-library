import nem from 'nem-sdk';
import { NetworkType } from 'nem2-sdk';
import { Apostille } from '../../src/Apostille';
import { SHA256, MD5, SHA1, SHA3256, SHA3512 } from '../../src/hashFunctions';

// prepare hashing object
const chooseHash = function(hashing) {
  if (hashing === 'MD5') {
    return new MD5;
  } else if (hashing === 'SHA1') {
    return new SHA1;
  } else if (hashing === 'SHA256') {
    return new SHA256;
  } else if (hashing === 'SHA3-256') {
    return new SHA3256;
  } else {
    return new SHA3512;
  }
};

const tag = 'NEM is Awesome!';
// A funny but valid private key
const signer = 'aaaaaaaaaaeeeeeeeeeebbbbbbbbbb5555555555dddddddddd1111111111aaee';

// Create a common object holding key
const common = nem.model.objects.create('common')('', signer);

// Simulate the file content
const payload = nem.crypto.js.enc.Utf8.parse('Apostille is awesome !');

// Create the Apostille
let oldPrivateApostille = nem.model.apostille.create(common, 'NEM is Awesome!', payload, 'Test Apostille', nem.model.apostille.hashing['SHA256'], false, {}, true, nem.model.network.data.testnet.id);

let newPrivateApostille = new Apostille(tag, signer, NetworkType.TEST_NET);

describe('HD account generation should be correct', () => {
  it('private key should be valid', () => {
    expect(nem.utils.helpers.isPrivateKeyValid(newPrivateApostille.privateKey)).toBeTruthy();
  });

  it('public key should be valid', () => {
    expect(nem.utils.helpers.isPublicKeyValid(newPrivateApostille.publicKey)).toBeTruthy();
  });

  it('should generate the same HD account as old apostille', () => {
    expect(oldPrivateApostille.data.dedicatedAccount.privateKey.toUpperCase() === newPrivateApostille.privateKey).toBeTruthy();
  });
});


/*** Test for SHA256 ***/
let hashType = chooseHash('SHA256');
newPrivateApostille.create(payload, hashType);

describe('private apostille hash should be correct', () => {
  it('should generate correct signed checksum with sha-256', () => {
    expect(newPrivateApostille.apostilleHash.substring(0, 10)).toMatch(oldPrivateApostille.data.checksum);
  });

  it('should generate correct hash with sha-256', () => {
    expect(newPrivateApostille.apostilleHash).toMatch(oldPrivateApostille.data.hash);
  });
});

/*** Test for MD5, SHA1, SHA3-256, SHA3-512 ***/
const hashArray = ['MD5', 'SHA1', 'SHA3-256', 'SHA3-512'];

hashArray.forEach(hash => {
  oldPrivateApostille = nem.model.apostille.create(common, 'NEM is Awesome!', payload, 'Test Apostille', nem.model.apostille.hashing[hash], false, {}, true, nem.model.network.data.testnet.id);

  newPrivateApostille = new Apostille(tag, signer, NetworkType.TEST_NET);

  hashType = chooseHash(hash);
  newPrivateApostille.create(payload, hashType);

  describe('private apostille hash should be correct', () => {
    it(`should generate correct signed checksum with ${hash}`, () => {
      expect(newPrivateApostille.apostilleHash.substring(0, 10)).toMatch(oldPrivateApostille.data.checksum);
    });

    it(`should generate correct hash with ${hash}`, () => {
      expect(newPrivateApostille.apostilleHash).toMatch(oldPrivateApostille.data.hash);
    });
  });
});
