import { createHmac } from 'crypto';

const ALGORITHM = 'sha256';
const SECRET_KEY = 'yealink'; // fake value

export default function genAuth(options) {
  const { appId, method = 'POST', path } = options;

  const random = '12345678';
  const nonce = `${Date.now()}:${random}`;

  const hmac = createHmac(ALGORITHM, SECRET_KEY);

  const text = `${[ nonce, appId, method, path ].join('\n')}\n`;

  hmac.update(text);

  const digest = hmac.digest('base64');

  const signText = `appid="${appId}",nonce="${nonce}",sign="${digest}"`;

  return signText;
}
