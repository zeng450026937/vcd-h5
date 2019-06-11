import { debounce } from 'lodash';
import ERROR_MAP from './error-map';
import { $t } from '../../i18n';

let ERROR_QUEUE = Promise.resolve();

export const debounceNotice = debounce((ctx, message) => {
  ERROR_QUEUE = ERROR_QUEUE.then(() => ctx.$message.error(message));
}, 200);

export default async function errorMessage(ctx, next) {
  let ret;

  try {
    ret = await next();
  }
  catch (error) {
    if (!error) debounceNotice(ctx.vm, $t('common.message.unKnownError'));
    else {
      let key = error.cause || (error.data && error.data.cause) || error.message;

      if (!key) {
        console.warn(error);
        debounceNotice(ctx.vm, $t('common.message.unKnownError'));
      }
      else if (key.startsWith('getaddrinfo ENOTFOUND')) {
        key = 'ENOTFOUND';
      }

      if (ERROR_MAP[key]) {
        debounceNotice(ctx.vm, $t(ERROR_MAP[key][error.origin] || ERROR_MAP[key]));
      }
    }

    throw error;
  }

  return ret;
}
