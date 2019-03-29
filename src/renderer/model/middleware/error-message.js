import ERROR_MAP from './error-map';

export default async function errorMessage(ctx, next) {
  try {
    await next();
  }
  catch (error) {
    if (!error) throw new Error('undefined');

    let key = error.cause || (error.data && error.data.cause);

    if (typeof error.message === 'string' && !key) {
      if (error.message.startsWith('getaddrinfo ENOTFOUND')) {
        key = 'ENOTFOUND';
      }
    }

    if (ERROR_MAP[key]) {
      ctx.vm.$message.error(ERROR_MAP[key]);
    }
    
    throw error;
  }
}
