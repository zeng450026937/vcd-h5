const si = require('systeminformation/lib/system');


export function system() {
  return new Promise(async(resolve) => {
    const info = await si.system();

    resolve(info);
  });
}

export default {
  system,
};
