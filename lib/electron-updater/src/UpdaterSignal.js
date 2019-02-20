export const DOWNLOAD_PROGRESS = 'download-progress';
export const UPDATE_DOWNLOADED = 'update-downloaded';

export class UpdaterSignal {
  constructor(emitter) {
    this.emitter = emitter;
  }

  /**
   * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
   */
  login(handler) {
    addHandler(this.emitter, 'login', handler);
  }

  progress(handler) {
    addHandler(this.emitter, DOWNLOAD_PROGRESS, handler);
  }

  updateDownloaded(handler) {
    addHandler(this.emitter, UPDATE_DOWNLOADED, handler);
  }

  updateCancelled(handler) {
    addHandler(this.emitter, 'update-cancelled', handler);
  }
}

const isLogEvent = false;

function addHandler(emitter, event, handler) {
  if (isLogEvent) {
    emitter.on(event, (...args) => {
      console.log('%s %s', event, args);
      handler(...args);
    });
  }
  else {
    emitter.on(event, handler);
  }
}
