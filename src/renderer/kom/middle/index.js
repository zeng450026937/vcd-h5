import ERROR_MAP from './constant';
import afterLogin from './afterLogin';
import crashReport from './crashReport'


const errorNotice = async(ctx, next) => {
  try {
    await next();
  }
  catch (e) {
    console.warn(e);
    const errorKey = e.cause || (e.data && e.data.cause);

    ctx.vm.$message.error(ERROR_MAP[errorKey] || e.message);
    throw e;
  }
};

export default [ errorNotice, afterLogin, crashReport ];
