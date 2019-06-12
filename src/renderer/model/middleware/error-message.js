import { ERROR_MAP, ERROR_CODE_MAP } from './error-map';
import { $t } from '../../i18n';

export default async function errorMessage(ctx, next) {
  let ret;

  try {
    ret = await next();
  }
  catch (error) {
    console.warn(error);
    if (!error) return ctx.vm.$message.error($t('common.message.unKnownError'));

    if (error.errorCode && error.msg) return ctx.vm.$message.error(ERROR_CODE_MAP[error.errorCode]);
    let key = error.cause || (error.data && error.data.cause) || error.message;

    if (!key) return ctx.vm.$message.error($t('common.message.unKnownError'));

    if (key.startsWith('getaddrinfo ENOTFOUND')) {
      key = 'ENOTFOUND';
    }

    if (ERROR_MAP[key]) {
      ctx.vm.$message.error($t(ERROR_MAP[key][error.origin] || ERROR_MAP[key]));
    }

    throw error;
  }

  return ret;
}
