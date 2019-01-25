import DNS from 'dns';
import Util from 'util';

const dns_lookup = Util.promisify(DNS.lookup);
const dns_resolveSrv = Util.promisify(DNS.resolveSrv);

const srv_cache = {};
const srv_refresh_interval = 60 * 60 * 1000;

class SRV {
  static Lookup(name) {
    return dns_lookup(name, { all: true })
      .catch((error) => {
        throw error;
      });
  }

  static Resolve(name) {
    if (srv_cache[name]) {
      return Promise.resolve(srv_cache[name]);
    }

    return dns_resolveSrv(name)
      .then((addresses) => {
        const lookups = [];

        addresses.forEach((address) => {
          lookups.push(SRV.Lookup(address.name)
            .then((addrs) => addrs.map((addr) => Object.assign({}, address, addr, { name: addr.address }))));
        });

        return Promise.all(lookups);
      })
      .then((addresses) => addresses.reduce((pre, cur) => cur.reduce((subpre, subcur) => {
        subpre.push(subcur);

        return subpre;
      }, pre), []))
      .then((addresses) => {
        srv_cache[name] = addresses;

        return addresses;
      })
      .catch((error) => {
        throw error;
      });
  }
}

setInterval(() => {
  Object.keys(srv_cache).forEach((key) => {
    SRV.Resolve(key).catch(() => {});
  });
}, srv_refresh_interval);

export default SRV;
