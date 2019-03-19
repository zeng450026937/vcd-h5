import Vuem from 'vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      navigatorInfor : {},
      network        : {},
    };
  },
  created() {
    this.init();
  },
  methods : {
    init() {
      // console.log(navigator);
      this.navigatorInfor = {
        appName             : navigator.appName,
        appCodeName         : navigator.appCodeName,
        appVersion          : navigator.appVersion,
        cookieEnabled       : navigator.cookieEnabled,
        language            : navigator.language,
        languages           : navigator.languages,
        userAgent           : navigator.userAgent,
        platform            : navigator.platform,
        hardwareConcurrency : navigator.hardwareConcurrency, // cpu内核数,
        deviceMemory        : navigator.deviceMemory, // 内存容量
      };
      this.network = navigator.connection;
      navigator.connection.onchange = (data) => {
        this.networkStatusChange();
      };
      navigator.connection.ontypechange = (data) => {
        this.networkStatusChange();
      };
      // navigator.mediaDevices.getUserMedia()
      // console.log(this);
    },
  },
  networkStatusChange() {
    this.network = navigator.connection;
  },
});

// model.use(() => {});

export default model;
