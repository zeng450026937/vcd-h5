const LOAD_MODE = {
  AUTO    : 'AUTO',
  OVERALL : 'OVERALL',
  SPLIT   : 'SPLIT',
};

const DEFAULT_TYPE = [
  'STAFF', 'DEVICE', 'VMR', 'EXTERNAL_CONTACTS', 'SERVICE_NUMBER',
].join(',');


export class BaseContact {
  static get LOAD_MODE() {
    return LOAD_MODE;
  }

  static get DEFAULT_TYPE() {
    return DEFAULT_TYPE;
  }

  constructor() {
    this.version = 'v1'; // phonebook version
    this.loadmode = LOAD_MODE.AUTO;
    this.type = DEFAULT_TYPE;
    this.url = null;
    this.apiVersion = 'v1'; // api version
    this.auth = {};
    this.permissionVersion = 0;
    this.dataVersion = 0;
  }

  init(config) {
    const {
      phoneBookUrl,
      apiVersion,
      phoneBookVersion,
      type,
      phoneBookLoadMode,
    } = config;

    this.loadmode = phoneBookLoadMode;
    this.apiVersion = apiVersion;
    this.version = phoneBookVersion;
    this.type = type;
    this.url = phoneBookUrl;
  }

  checkRespones(res) {
    const { data } = res;
  
    if (data.ret <= 0) throw new Error(data.error);
  
    return data.data;
  }
}
