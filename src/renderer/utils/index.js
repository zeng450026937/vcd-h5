export const isCapsLockOn = (e) => {
  const valueCapsLock = e.keyCode ? e.keyCode : e.which; // Caps Lock 是否打开
  const valueShift = e.shiftKey ? e.shiftKey : ((valueCapsLock === 16)); // shift键是否按住

  return ((valueCapsLock >= 65 && valueCapsLock <= 90) && !valueShift) // Caps Lock 打开，并且 shift键没有按住
    || ((valueCapsLock >= 97 && valueCapsLock <= 122) && valueShift);
};
