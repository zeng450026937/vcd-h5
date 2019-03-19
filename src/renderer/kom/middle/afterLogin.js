export default async(ctx, next) => next().then(async() => {
  if (ctx.ns === 'login' && ctx.method === 'doLogin') {
    window.api.updateClientInfo({
      user : {
        account      : ctx.payload.account,
        domain       : ctx.payload.server,
        outbound     : `${ctx.vm.login.proxy}:${ctx.vm.login.proxyPort}`,
        outboundPort : ctx.vm.login.proxyPort,
        status       : 'registered',
      },
    });
  }
});
