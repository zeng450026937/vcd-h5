export function defer(timeout, resolve_cb, reject_cb) {
  const d = {
    promise : null,
    resolve : null,
    reject  : null,
  };

  let timer;

  d.promise = new Promise(((resolve, reject) => {
    d.resolve = (result) => {
      clearTimer();
      if (resolve_cb) resolve_cb(result);
      resolve(result);
    };
    d.reject = (result) => {
      clearTimer();
      if (reject_cb) resolve_cb(result);
      reject(result);
    };
  }));

  if (timeout) {
    timer = setTimeout(d.reject, timeout);
  }

  function clearTimer() {
    if (!timer) return;
    clearTimeout(timer);
    timer = null;
  }

  return d;
}
