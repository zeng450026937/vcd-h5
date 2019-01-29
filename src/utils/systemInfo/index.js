const si = require('systeminformation/lib/system');

export default async() => {
  const info = await si.system().catch((e) => Promise.reject(e));

  return new Promise((resolve) => resolve(info));
};
