import { deviceManagement, enterprise, ylDeviceManagement } from '../../service';
import { getSystemInfo } from '../../proxy/main-process-proxy';


async function genClentInfo(accountInfo) {
  const [ { data:{ data:enterpriseInfo } }, sysInfo ] = await Promise.all([
    enterprise.getEnterpriseInfo(),
    getSystemInfo(),
  ]);

  return Promise.resolve(Object.assign(
    sysInfo,
    {
      account     : accountInfo.account,
      serviceAddr : accountInfo.server,
    },
    {
      enterpriseId : enterpriseInfo.enterpriseId,
    }
  ));
}

function updateClientInfo(info) {
  const { enterpriseId, clientId } = info;

  if (enterpriseId) deviceManagement.clientUpdate(clientId, info);
  ylDeviceManagement.clientUpdate(clientId, info);
}


function clientHeart({ enterpriseId, clientId }) {
  if (enterpriseId) deviceManagement.clientHeart(clientId);
  ylDeviceManagement.clientHeart(clientId);
}

function doHeart(info) {
  clientHeart(info);

  const heartTimer = (timeout) => {
    window.clientHeart = setTimeout(async() => {
      clientHeart(info);
      heartTimer(5 * 60 * 1000 - random(30 * 1000, 60 * 1000));
    }, timeout);
  };

  heartTimer(5 * 60 * 1000 - random(30 * 1000, 60 * 1000));
}

function random(a, b) {
  const c = b - a + 1;

  return Math.floor(Math.random() * c + a);
}

export default async(ctx, next) => next().then(async() => {
  if (ctx.ns === 'login' && ctx.method === 'doLogin') {
    const info = await genClentInfo(ctx.payload);

    updateClientInfo(info);
    doHeart(info);
  }
});
