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
          <div class="mt-3">
            <a-switch size="small" v-model="shareSmoothMode"/>
            <span class="setting-label">{{$t('setting.conference.preferredPictureFluency')}}</span>
          </div> 
          <!--<div class="mt-3">-->
            <!--<a-switch size="small" v-model="shareWithSound"/>-->
            <!--<span class="setting-label">{{$t('setting.conference.shareComputerSound')}}</span>-->
          <!--</div>-->
        </div>
      </div>
      <div>
        <div class="flex flex-col mt-5">
          <div class="flex items-center">
            <span class="border-l-4 border-black h-4"></span>
            <span class="setting-title">{{$t('setting.conference.baseSetting')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="dnd"/>
            <span class="setting-label">{{$t('setting.conference.dndWhenCalling')}}</span>
          </div>
          <div class="mt-3">
            <div>{{$t('setting.conference.videoQuality')}}</div>
            <a-select v-model="videoQuality" class="w-48 mt-3">
              <a-select-option v-for="(quality, index) in videoQualities" :key="index"
                               :value="quality.value"
              >{{quality.label}}</a-select-option>
            </a-select>
            <span class="text-black6 text-xs ml-4">{{qualityTips}}</span>
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
import AppHeader from '../../../components/Main/MainHeader.vue';

export default {
  name : 'ConferenceSetting',

  components : {
    AppHeader,
  },
  
  data() {
    return {
      advancedSettingUrl : 'http://www.yealink.com',
      videoQualities     : [
        { label: this.$t('setting.conference.superMode'), value: '1080P' },
        { label: this.$t('setting.conference.HDMode'), value: '720P' },
        { label: this.$t('setting.conference.SDMode'), value: '360P' },
      ],
    };
  },
  computed : {
    qualityTips() {
      const TIPS = {
        '1080P' : this.$t('setting.conference.tipFor1080P'),
        '720P'  : this.$t('setting.conference.tipFor720P'),
        '360P'  : this.$t('setting.conference.tipFor360P'),
      };
      
      return TIPS[this.videoQuality];
    },
  },
  mounted() {
  },
  sketch : [
    {
      ns    : 'setting',
      props : [ 
        'minimizedWhenLocalSharing',
        'maximizedWhenRemoteSharing',
        'shareWithSound',
        'shareSmoothMode',
        'dnd',
        'enableLocalVideo',
        'videoQuality',
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
