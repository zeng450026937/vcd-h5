export function newUUID() {
  const UUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    /* eslint-disable no-bitwise */
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    /* eslint-enable no-bitwise */

    return v.toString(16);
  });

  return UUID;
}

export function hexToBytes(hex) {
  // TODO: deprecate: "Deprecated. Use util.binary.hex.decode instead."
  let rval = '';
  let i = 0;
  
  /* eslint-disable no-bitwise */
  /* eslint-disable no-self-compare */
  if (hex.length & 1 === 1) {
    // odd number of characters, convert first character alone
    i = 1;
    rval += String.fromCharCode(parseInt(hex[0], 16));
  }
  /* eslint-enable no-bitwise */
  /* eslint-enable no-self-compare */

  // convert 2 characters (1 byte) at a time
  for (; i < hex.length; i += 2) {
    rval += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  
  return rval;
}

const _base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export function encode64(input, maxline) {
  let line = '';
  let output = '';
  let chr1;
  let chr2;
  let chr3;
  let i = 0;

  /* eslint-disable no-bitwise */
  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);

    // encode 4 character group
    line += _base64.charAt(chr1 >> 2);
    line += _base64.charAt(((chr1 & 3) << 4) | (chr2 >> 4));
    if (Number.isNaN(chr2)) {
      line += '==';
    }
    else {
      line += _base64.charAt(((chr2 & 15) << 2) | (chr3 >> 6));
      line += Number.isNaN(chr3) ? '=' : _base64.charAt(chr3 & 63);
    }

    if (maxline && line.length > maxline) {
      output += `${line.substr(0, maxline)}\r\n`;
      line = line.substr(maxline);
    }
  }
  /* eslint-enable no-bitwise */

  output += line;
  
  return output;
}
