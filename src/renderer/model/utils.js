import SRV from '../../shared/srv';

export async function formatServers(options) {
  const {
    server,
    protocol = 'wss',
    proxy,
    port,
  } = options;

  let servers;

  if (!proxy) {
    try {
      const pre = protocol === 'wss' ? '_sips._wss.' : '_sips._tcp.';

      servers = await SRV.Resolve(pre + server);
    }
    catch (error) {
      servers = await SRV.Lookup(server);
    }
  }
  else {
    const [ address, attachedPort ] = proxy.split(':');

    servers = [ { address, port: attachedPort || port } ];
  }

  return servers.map((s) => ({
    url    : `${protocol}://${s.address}:${s.port || port}`,
    weight : s.weight || s.priority,
  }));
}
