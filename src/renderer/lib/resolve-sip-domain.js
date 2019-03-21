import SRV from '../../shared/srv';

// protocol
// 'wss'
// 'tcp'
export async function resolveSipDomain(domain, protocol = 'wss') {
  let servers;

  try {
    servers = await SRV.Resolve(`_sips._${protocol}.${domain}`);
  }
  catch (error) {
    servers = await SRV.Lookup(domain);
  }

  return servers;
}
