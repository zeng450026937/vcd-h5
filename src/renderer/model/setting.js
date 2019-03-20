import Vuem from './vuem';

const storage = window.localStorage;

const VERSION = '1';
const STORAGE_KEY = `SETTING_V${VERSION}`;

const model = new Vuem();

model.provide({
  data() {
    return {
      // common
      language                   : 'zh-CN',
      hardwareAcceleration       : true, // consider to be removed, currently not work
      autoStart                  : false,
      autoUpdate                 : true,
      updateChannel              : 'stable',
      hideWhenClose              : false,
      // ytms
      ytmsHostAddress            : '',
      // account
      autoLogin                  : false,
      savePassword               : false,
      // media
      audioInputDevice           : '',
      videoInputDevice           : '',
      videoOutputDevice          : '',
      highProfile                : false,
      horizontalMirroring        : false,
      // conference
      minimizedWhenLocalSharing  : false,
      maximizedWhenRemoteSharing : false,
      muteAudioWhenJoin          : false,
      muteVideoWhenJoin          : false,
      shareWithSound             : false,
      meetnowPassword            : false,
      bookingPassword            : false,
      noticeTip                  : false,
      noticeSound                : false,
      // p2p
      dnd                        : false,
    };
  },

  middleware : {
    async load(ctx, next) {
      await next();
      
      this.load();
    },

    async save(ctx, next) {
      await next();

      this.save();
    },
  },

  methods : {
    // load all setting
    load() {
      let saved;

      try {
        saved = storage.getItem(STORAGE_KEY);
        saved = JSON.parse(saved);
      }
      catch (error) {
        logger.error('load setting failed, error: %s', error);
        saved = {};
      }

      Object.keys(saved).forEach((key) => this[key] = saved[key]);
    },

    // save all setting
    save() {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(this.$data));
      }
      catch (error) {
        logger.error('save setting failed, error: %s', error);
      }
    },
  },
  
  created() {
    this.load();
  },

  beforeDestroy() {
    this.save();
  },
});

export default model;
