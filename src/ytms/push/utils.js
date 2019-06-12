import { createHmac } from 'crypto';

export const ALGORITHM = 'sha256';
export const SECRET_KEY = 'yealink';

export const sign = function(
  { path,
    appid = 'vcs',
    algorithm = ALGORITHM,
    secretKey = SECRET_KEY,
  } = {}
) {
  const method = 'POST';
  const random = '12345678';
  const nonce = `${Date.now()}:${random}`;

  const hmac = createHmac(algorithm, secretKey);

  const text = `${[ nonce, appid, method, path ].join('\n')}\n`;

  hmac.update(text);

  const digest = hmac.digest('base64');

  const signText = `appid="${appid}",nonce="${nonce}",sign="${digest}"`;

  return signText;
};

export const parseJSON = function(json) {
  let obj;

  try {
    obj = JSON.parse(json);
  }
  catch (e) {
    obj = {};
  }

  return obj;
};
