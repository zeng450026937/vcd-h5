import md5 from 'md5';

export const genDigest = function(args) {
  const { username, realm, nonce, uri, cNonce, nc, response } = args;

  return `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", cnonce="${cNonce}", nc="${nc}", response="${response}", qop="auth"`;
};

export const genResponse = function(args) {
  const { ha1, nonce, nc, cNonce, qop, ha2 } = args;

  return md5(`${ha1}:${nonce}:${nc}:${cNonce}:${qop}:${ha2}`);
};

export const genHa1 = function(args) {
  const { username, password, realm } = args;

  return md5(`${username}:${realm}:${password}`);
};

export const genHa2 = function(args) {
  return md5(`POST:${args.uri}`);
};
