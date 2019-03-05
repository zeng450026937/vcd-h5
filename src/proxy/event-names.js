export const eventNames = {
  'renderer-ready' : {
    from  : 'renderer',
    to    : 'browser',
    reply : false,
    sync  : false,
  },
  'will-quit'           : {},
  'after-login'         : {},
  'request-system-info' : {},
};

export function toIPCName(event) {
  return {
    req : `ipc-${event}`,
    res : `ipc-${event}-reply`,
  };
}

export default eventNames;
