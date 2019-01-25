import log4electron from '../../../logger';

const logger = log4electron.getLogger('BROWSER');

const errorNotice = async(ctx, next) => {
  try {
    await next();
  }
  catch (e) {
    logger.error(e);
    ctx.vm.$message.error(e.message);
    throw e;
  }
};

export default [ errorNotice ];
