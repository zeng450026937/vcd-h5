import ERROR_MAP from './constant';


const errorNotice = async(ctx, next) => {
  try {
    await next();
  }
  catch (e) {
    const errorKey = e.cause || (e.data && e.data.cause);

    ctx.vm.$message.error(ERROR_MAP[errorKey] || e.message);
    throw e;
  }
};

export default [ errorNotice ];
