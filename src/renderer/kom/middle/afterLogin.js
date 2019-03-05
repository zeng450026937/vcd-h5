export default async(ctx, next) => next().then(async() => {
  if (ctx.ns === 'login' && ctx.method === 'doLogin') {
    // TODO
    Object.keys(window.apis).forEach((server) => {
      window.apis[server].updateClientInfo( {
        user : {
          account : ctx.payload.account,
          domain  : ctx.payload.server,
        },
      });
    });
  }
});
