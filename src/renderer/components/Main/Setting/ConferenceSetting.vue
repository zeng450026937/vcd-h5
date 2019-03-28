<template>
  <a-layout id="conference-setting" class="h-full">
    <div class="h-14 border-b">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>{{$t('setting.conference.title')}}</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <div class="flex flex-col border h-full m-4 bg-white p-5 overflow-y-auto">
      <div>
        <div class="flex flex-col">
          <div class="flex items-center">
            <span class="border-l-4 border-black h-4"></span>
            <span class="setting-title">{{$t('setting.conference.share')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="minimizedWhenLocalSharing"/>
            <span class="setting-label">{{$t('setting.conference.minWindowWhenSharing')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="maximizedWhenRemoteSharing"/>
            <span class="setting-label">{{$t('setting.conference.maxWindowWhenWatchingSharing')}}</span>
          </div>
          <!-- <div class="mt-3">
            <a-switch size="small" v-model="enableGpu"/>
            <span class="setting-label">{{$t('setting.conference.enableGpu')}}</span>
          </div>-->
          <div class="mt-3">
            <a-switch size="small" v-model="highProfile"/>
            <span class="setting-label">{{$t('setting.conference.preferredPictureFluency')}}</span>
          </div> 
          <div class="mt-3">
            <a-switch size="small" v-model="shareWithSound"/>
            <span class="setting-label">{{$t('setting.conference.shareComputerSound')}}</span>
          </div>
        </div>
      </div>
      <div>
        <div class="flex flex-col mt-5">
          <div class="flex items-center">
            <span class="border-l-4 border-black h-4"></span>
            <span class="setting-title">{{$t('setting.conference.baseSetting')}}</span>
          </div>
          <!-- <div class="mt-3">
            <a-switch size="small" v-model="muteAudioWhenJoin"/>
            <span class="setting-label">{{$t('setting.conference.autoSilence')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="showNoticeTip"></a-switch>
            <span class="setting-label">{{$t('setting.conference.noticeWhenLeaving')}}</span> 
            <a-tooltip>
              <template slot='title'>
                {{$t('setting.conference.noticeTitle')}}
              </template>
              <a-iconfont type="icon-tishi" class="ml-3 text-indigo-dark cursor-pointer text-base"/>
            </a-tooltip>
          </div>
          
          <div class="flex flex-col ml-10">
            <a-radio-group class="mt-2" v-model="noticeTip" :disabled="!noticeTip">
              <a-radio  :value="1">{{$t('setting.conference.noticeOnlyJoiner')}}</a-radio>
              <a-radio  :value="2">{{$t('setting.conference.noticeBoth')}}</a-radio>
              <a-radio  :value="3">{{$t('setting.conference.noticeAll')}}</a-radio>
            </a-radio-group>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="meetnowPassword"/>
            <span class="setting-label">{{$t('setting.conference.instanceMeetingPassword')}}</span>
          </div>

          <div class="mt-3">
            <a-switch size="small" v-model="loginOptions"/>
            <span class="setting-label">{{$t('setting.conference.loginSelector')}}</span>
          </div> -->
          <div class="mt-3">
            <a-switch size="small" v-model="dnd"/>
            <span class="setting-label">{{$t('setting.conference.dndWhenCalling')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="enableLocalVideo"/>
            <span class="setting-label">启用本地视频</span>
          </div>
        </div>
      </div>
      <div>
        <div class="mt-10">
          <a-button type="primary"  @click="handleAdvancedSetting">
            <span class="leading-tight px-1">{{$t('setting.conference.advancedSetting')}}</span>
          </a-button>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import { shell } from 'electron';
import AppHeader from '../MainHeader.vue';

export default {
  name : 'ConferenceSetting',

  components : {
    AppHeader,
  },
  
  data() {
    return {
      // advanceEntryTimeRange : [ 5, 180 ],
      // showAdvanceTimeError  : false,
      // advanceTimeErrorText  : '',
      // customPasswordInput   : '',
      // showCustomPsdError    : false,
      // customPsdErrorText    : '',
      // settings not supported yet
      // advanceEntryTime      : 5,
      // isRandomOrCustom      : false,
      // showNoticeTip         : false,
      // form                  : this.$form.createForm(this),
      advancedSettingUrl : 'http://www.yealink.com',
    };
  },
  computed : {
    // showNoticeTip : {
    //   set(val) {
    //     if (val) {
    //       this.noticeTip = 1;
    //     }
    //     else {
    //       this.noticeTip = 0;
    //     }
    //   },
    //   get() {
    //     return this.noticeTip > 0;
    //   },
    // },
  },
  mounted() {
    // this.customPasswordInput = this.customPassword;
  },
  sketch : [
    {
      ns    : 'setting',
      props : [ 
        'minimizedWhenLocalSharing',
        'maximizedWhenRemoteSharing',
        // 'enableGpu',
        'shareWithSound',
        // 'muteAudioWhenJoin',
        // 'noticeTip',
        // 'muteVideoWhenJoin',
        // 'customPassword',
        // 'meetnowPassword',
        // 'bookingPassword',
        // 'noticeSound',
        // 'loginOptions',
        'highProfile',
        'dnd',
        'enableLocalVideo',
      ],
    },
  ],

  deactivated() {
    this.$dispatch('setting.save');
  },

  destroyed() {
    this.$dispatch('setting.save');
  },
  
  methods : {
    checkAdvanceTime() {
      // eslint-disable-next-line radix
      if (!/^\d{1,3}$/.test(this.advanceEntryTime) || this.advanceEntryTime < this.advanceEntryTimeRange[0] || this.advanceEntryTime > this.advanceEntryTimeRange[1]) {
        this.showAdvanceTimeError = true;
        this.advanceTimeErrorText = '您输入的入会时间不合法！';
        
        return false;
      }
      else {
        this.showAdvanceTimeError = false;
        
        return true;
      }
    },

    // checkCustomPsd() {
    //   if (!/^\d{6}$/.test(this.customPasswordInput)) {
    //     this.showCustomPsdError = true;
    //     this.customPsdErrorText = '您输入的自定义密码不合法！';
        
    //     return false;
    //   }
    //   else {
    //     this.showCustomPsdError = false;
    //     this.customPassword = this.customPasswordInput;
        
    //     return true;
    //   }
    // },

    handleAdvancedSetting() {
      shell.openExternal(this.advancedSettingUrl);
    },
  },
};
</script>

<style lang="less">
#conference-setting {
  .setting-title {
    font-weight: 600;
  }
  .setting-title, .setting-label {
    padding-left: 12px;
    font-size: 14px;
    color: #333333;
    line-height: 22px;
  }
  .ant-radio-wrapper{
    display: block;
    margin-top: 10px;
  }
}
</style>
