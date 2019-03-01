export function calcWaitingTime(times, max = 300, min = 3) {
  /* eslint-disable no-restricted-properties */
  let k = Math.floor((Math.random() * Math.pow(2, times)) + 1);
  /* eslint-enable no-restricted-properties */

  if (k < min) {
    k = min;
  }
  else if (k > max) {
    k = max;
  }

  return k * 1000;
}

export async function waitFor(timeout) {
  return new Promise((resolve) => {
    if (!timeout) return resolve();
    setTimeout(resolve, timeout);
  });
}
