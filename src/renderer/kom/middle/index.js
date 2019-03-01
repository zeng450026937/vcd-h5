import log4electron from '../../../logger';
import ERROR_MAP from './constant';
import afterLogin from './afterLogin';
import crashReport from './crashReport'

const logger = log4electron.getLogger('BROWSER');

const errorNotice = async(ctx, next) => {
  try {
    await next();
  }
  catch (e) {
    logger.error(e);
    const errorKey = e.cause || (e.data && e.data.cause);

    ctx.vm.$message.error(ERROR_MAP[errorKey] || e.message);
    throw e;
  }
};

export default [ errorNotice, afterLogin, crashReport ];
