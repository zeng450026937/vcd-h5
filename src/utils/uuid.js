function gen(template) {
  return template.replace(/[xy]/g, (c) => {
    /* eslint-disable no-bitwise */
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    /* eslint-enable no-bitwise */

    return v.toString(16);
  });
}

export function newUUID() {
  return gen('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
}

export function newPlainUUID() {
  return gen('xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx');
}
