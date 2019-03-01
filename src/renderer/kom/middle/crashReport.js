import { sendCrashReport } from '../../proxy/main-process-proxy';
import ERROR_MAP from './constant';


export default async(ctx, next) => {
  try {
    await next();
  }
  catch (e) {
    const errorKey = e.cause || (e.data && e.data.cause);

    sendCrashReport(ERROR_MAP[errorKey] || e.message);

    throw e;
  }
};
