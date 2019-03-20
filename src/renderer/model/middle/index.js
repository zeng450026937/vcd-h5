import ERROR_MAP from './constant';

let errorQueue = Promise.resolve();


const errorNotice = async(ctx, next) => {
  try {
    await next();
  }
  catch (e) {
    if (!e) throw e;

    let errorKey = e.cause || (e.data && e.data.cause);

    if (typeof e.message === 'string' && !errorKey) {
      if (e.message.startsWith('getaddrinfo ENOTFOUND')) {
        errorKey = 'ENOTFOUND';
      }
    }

    errorQueue = errorQueue.then(() => ctx.vm.$message.error(ERROR_MAP[errorKey] || e.message)).catch(() => {});
    throw e;
  }
};

export default errorNotice;
