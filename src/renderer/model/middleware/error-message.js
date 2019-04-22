import { debounce } from 'lodash';
import ERROR_MAP from './error-map';

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
    if (!error) throw new Error('undefined');

    let key = error.cause || (error.data && error.data.cause) || error.message;

    if (key.startsWith('getaddrinfo ENOTFOUND')) {
      key = 'ENOTFOUND';
    }
    if (ERROR_MAP[key]) {
      debounceNotice(ctx.vm, ERROR_MAP[key]);
    }
    
    throw error;
  }

  return ret;
}
