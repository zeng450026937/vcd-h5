export const isCapsLockOn = (e) => {
  const valueCapsLock = e.keyCode ? e.keyCode : e.which; // Caps Lock 是否打开
  const valueShift = e.shiftKey ? e.shiftKey : ((valueCapsLock === 16)); // shift键是否按住

  return ((valueCapsLock >= 65 && valueCapsLock <= 90) && !valueShift) // Caps Lock 打开，并且 shift键没有按住
    || ((valueCapsLock >= 97 && valueCapsLock <= 122) && valueShift);
};

export const IP_REG = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}(:[0-9]{1,5})?$/;
export const DOMAIN_REG = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:[0-9]{1,5})?$/;

export const wait = async(timeout = 0) => new Promise((resolve) => {
  if (timeout) {
    setTimeout(() => {
      resolve();
    }, timeout);
  }
});

export const secondsToHms = (d) => {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor(d % 3600 % 60);

  return `${(h < 10 ? '0' : '') + h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};
