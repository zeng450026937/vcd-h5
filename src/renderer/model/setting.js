import { ipcRenderer } from 'electron';
import Vuem from './vuem';

const storage = window.localStorage;

const VERSION = '1';
const STORAGE_KEY = `SETTING_V${VERSION}`;
const LANGUAGE = navigator.browserLanguage || navigator.languages[0] || navigator.language;

const model = new Vuem();

model.provide({
  data() {
    return {
      // common
      language                   : LANGUAGE,
      hardwareAcceleration       : true, // consider to be removed, currently not work
      autoStart                  : false,
      autoUpdate                 : true,
      updateChannel              : 'stable',
      hideWhenClose              : true,
      // ytms
      ytmsHostAddress            : '',
      // account
      autoLogin                  : false,
      savePassword               : false,
      // media
      audioInputDevice           : null,
      audioOutputDevice          : null,
      videoInputDevice           : null,
      highProfile                : false,
      horizontalMirroring        : false,
      // conference
      minimizedWhenLocalSharing  : true,
      maximizedWhenRemoteSharing : true,
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

  watch : {
    language(val) {
      this.$broadcast('language-change', val);
    },
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

    ipcRenderer.on(
      'system-config',
      async(event, { config }) => {    
        const {
          pushUpdateChannelFlag,
          pushYtmsHostFlag,
          updateChannel,
          ytmsHostAddress,
        } = config;
    
        if (pushUpdateChannelFlag && updateChannel) {
          this.updateChannel = updateChannel;
        }
    
        if (pushYtmsHostFlag && ytmsHostAddress) {
          this.ytmsHostAddress = ytmsHostAddress;
        }
      }
    );
  },

  beforeDestroy() {
    this.save();
  },
});

export default model;
