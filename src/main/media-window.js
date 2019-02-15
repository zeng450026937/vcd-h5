import {
  BaseWindow,
} from './base-window';
import { formatPathAsUrl } from './utils';

const minWidth = 600;
const minHeight = 500;

export class MediaWindow extends BaseWindow {
  constructor(options) {
    const windowOptions = options || {
      width           : minWidth,
      height          : minHeight,
      minWidth,
      minHeight,
      show            : false,
      // This fixes subpixel aliasing on Windows
      // See https://github.com/atom/atom/commit/683bef5b9d133cb194b476938c77cc07fd05b972
      backgroundColor : '#fff',
      webPreferences  : {
        // Disable auxclick event
        // See https://developers.google.com/web/updates/2016/10/auxclick
        disableBlinkFeatures    : 'Auxclick',
        // Explicitly disable experimental features for the crash process
        // since, theoretically it might be these features that caused the
        // the crash in the first place. As of writing we don't use any
        // components that relies on experimental features in the crash
        // process but our components which relies on ResizeObserver should
        // be able to degrade gracefully.
        experimentalFeatures    : false,
        nativeWindowOpen        : false,
        nodeintegration         : false,
        nodeIntegrationInWorker : false,
        webSecurity             : false,
      },
    };

    super(windowOptions);
  }

  load(url) {
    this.rendererReadyTime = 0;
    this.hasFinishedRendering = true;

    this.maybeEmitDidLoad();

    if (process.env.NODE_ENV === 'development') {
      url = `${process.env.WEBPACK_DEV_SERVER_URL}window.html`;
    }
    else {
      url = formatPathAsUrl(__dirname, 'media.html');
    }

    super.load(url);
  }
}
