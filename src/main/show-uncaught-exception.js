import { app, dialog } from 'electron';
import { formatError } from '../logger/format-error';
import { CrashWindow } from './crash-window';

let hasReportedUncaughtException = false;

/** Show the uncaught exception UI. */
export function showUncaughtException(isLaunchError, error) {
  try {
    logger.error(formatError(error));
  }
  catch (e) {
  }

  if (hasReportedUncaughtException) {
    return;
  }

  hasReportedUncaughtException = true;

  const crashWindow = new CrashWindow(
    isLaunchError ? 'launch' : 'generic',
    error
  );

  crashWindow.onDidLoad(() => {
    crashWindow.show();
  });

  crashWindow.onFailedToLoad(() => {
    dialog.showMessageBox(
      {
        type    : 'error',
        title   : __DARWIN__ ? 'Unrecoverable Error' : 'Unrecoverable error',
        message :
          'GitHub Desktop has encountered an unrecoverable error and will need to restart.\n\n'
          + 'This has been reported to the team, but if you encounter this repeatedly please report '
          + `this issue to the GitHub Desktop issue tracker.\n\n${error.stack
            || error.message}`,
      },
      (response) => {
        if (process.env.NODE_ENV !== 'development') {
          app.relaunch();
        }
        app.quit();
      }
    );
  });

  crashWindow.onClose(() => {
    if (process.env.NODE_ENV !== 'development') {
      app.relaunch();
    }
    app.quit();
  });

  crashWindow.load();
}
