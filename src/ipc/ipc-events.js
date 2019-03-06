export const IPC_EVENTS = {
  LOG                : 'log',
  RENDERER_READY     : 'renderer-ready',
  CRASH_READY        : 'crash-ready',
  RINGING_READY      : 'ringing-ready',
  SCREEN_SHARE_READY : 'screen-share-ready',
  WILL_QUIT          : 'will-quit',
  CRASH_QUIT         : 'crash-quit',
};

export function setupEventHandler(handlers) {
  const ipc = global.ipc;

  if (!ipc) return;

  Object.keys(handlers).forEach((event) => ipc.on(event, handlers[event]));
}
