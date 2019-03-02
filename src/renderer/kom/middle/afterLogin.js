

export default async(ctx, next) => next().then(async() => {
  if (ctx.ns === 'login' && ctx.method === 'doLogin') {
    // TODO
  }
});
