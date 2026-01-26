import {
  decodeProfileMapFromScValXdr,
  encodeProfileMapToScValXdr,
  SEP29_PROFILE_VERSION,
} from './sep29';

describe('SEP-29 profile SCVal encode/decode', () => {
  it('encodes and decodes profile map', () => {
    const profile = {
      version: SEP29_PROFILE_VERSION,
      type: 2,
      updated: 1700000000,
      data_hash: 'bafybeigdyrzt6profilehash',
    };

    const xdr = encodeProfileMapToScValXdr(profile);
    const decoded = decodeProfileMapFromScValXdr(xdr);

    expect(decoded).toEqual(profile);
  });

  it('throws on missing required fields', () => {
    const badXdr = encodeProfileMapToScValXdr({
      version: SEP29_PROFILE_VERSION,
      type: 1,
      updated: 1700000001,
      data_hash: 'x',
    });

    const tampered = badXdr.slice(0, badXdr.length - 4);
    expect(() => decodeProfileMapFromScValXdr(tampered)).toThrow();
  });
});
