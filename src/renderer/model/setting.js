import { ipcRenderer } from 'electron';
import storage, { SETTING_STORAGE } from '../storage';
import Vuem from './vuem';
import rtc from '../rtc';

// const storage = window.localStorage;
//
// const VERSION = '1';
// const STORAGE_KEY = `SETTING_V${VERSION}`;

const model = new Vuem();

model.provide({
  data() {
    return {
      // common
      hardwareAcceleration       : true, // consider to be removed, currently not work
      autoStart                  : false,
      autoUpdate                 : true,
      updateChannel              : 'insiders', // 切换版本需要修改此默认值 比如 alpha 对应 insiders
      hideWhenClose              : false,
      tags                       : [],
      // ytms
      ytmsHostAddress            : '',
      // account
      autoLogin                  : false,
      savePassword               : false,
      // media
      audioInputDevice           : null,
      audioOutputDevice          : null,
      videoInputDevice           : null,
      audioQuality               : null,
      videoQuality               : '720P',
      screenQuality              : null,
      highProfile                : false,
      horizontalMirroring        : false,
      // conference
      minimizedWhenLocalSharing  : true,
      maximizedWhenRemoteSharing : true,
      muteAudioWhenJoin          : false,
      muteVideoWhenJoin          : false,
      shareSmoothMode            : false, 
      shareWithSound             : false,
      meetnowPassword            : false,
      bookingPassword            : false,
      noticeTip                  : false,
      noticeSound                : false,
      enableLocalVideo           : false,
      // p2p
      dndWhenCalling             : false,
      //
      showAdvanceSetting         : false,
    };
  },

  computed : {
    noiseSuppression : {
      get() {
        return rtc.media.localMedia.audioQuality.noiseSuppression;
      },
      set(val) {
        rtc.media.localMedia.audioQuality.noiseSuppression = !!val;
      },
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
        saved = storage.query(SETTING_STORAGE.SETTING);
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
        storage.insert(SETTING_STORAGE.SETTING, this.$data);
      }
      catch (error) {
        logger.error('save setting failed, error: %s', error);
      }
    },

    // reset all setting to default
    reset() {
      // TODO
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
    
        if (pushYtmsHostFlag && ytmsHostAddress) {
          this.ytmsHostAddress = ytmsHostAddress;
        }

        if (pushUpdateChannelFlag && updateChannel) {
          this.updateChannel = updateChannel;
        }
      }
    );
  },

  beforeDestroy() {
    this.save();
  },
});

export default model;
