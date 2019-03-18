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
            <a-switch size="small" v-model="minWindowWhenSharing"/>
            <span class="setting-label">{{$t('setting.conference.minWindowWhenSharing')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="maxWindowWhenWatchingSharing"/>
            <span class="setting-label">{{$t('setting.conference.maxWindowWhenWatchingSharing')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="enableGpu"/>
            <span class="setting-label">{{$t('setting.conference.enableGpu')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="preferredPictureFluency"/>
            <span class="setting-label">{{$t('setting.conference.preferredPictureFluency')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="shareComputerSound"/>
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
          <div class="mt-3">
            <a-switch size="small" v-model="autoSilence"/>
            <span class="setting-label">{{$t('setting.conference.autoSilence')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="noticeWhenLeaving"/>
            <span class="setting-label">{{$t('setting.conference.noticeWhenLeaving')}}</span> 
            <a-tooltip>
              <template slot='title'>
                {{$t('setting.conference.noticeTitle')}}
              </template>
              <a-iconfont type="icon-tishi" class="ml-3 text-indigo-dark cursor-pointer text-base"/>
            </a-tooltip>
            
          </div>
          <!--入会及离会提示音-->
          <div class="flex flex-col ml-10">
            <a-radio-group class="mt-2" v-model="selectedNotice" :disabled="!noticeWhenLeaving">
              <a-radio  :value="1">{{$t('setting.conference.noticeOnlyJoiner')}}</a-radio>
              <a-radio  :value="2">{{$t('setting.conference.noticeBoth')}}</a-radio>
              <a-radio  :value="3">{{$t('setting.conference.noticeAll')}}</a-radio>
            </a-radio-group>
          </div>
          <div class="mt-3">
            <span class="setting-label ml-0">{{$t('setting.conference.advanceEntryTime')}}</span>
            <a-input class="w-16 mx-4" v-model.number="advanceEntryTime" @blur="checkAdvanceTime"/>
            <span class="setting-label ml-0">{{$t('setting.conference.advanceEntryTimeUnite')}}</span>
            <span class="text-black9 setting-label ml-0">{{$t('setting.conference.advanceEntryTimeNotice')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="instanceMeetingPassword"/>
            <span class="setting-label">{{$t('setting.conference.instanceMeetingPassword')}}</span>
          </div>

          <div class="mt-3">
            <a-switch size="small" v-model="reserveMeetingPassword"/>
            <span class="setting-label">{{$t('setting.conference.reserveMeetingPassword')}}</span>
          </div>

          <div class="mt-1 ml-10">
            <a-radio-group v-model="isRandomOrCustom" :disabled="!reserveMeetingPassword">
              <a-radio  :value="1">{{$t('setting.conference.randomPassword')}}</a-radio>
              <a-radio  :value="2">{{$t('setting.conference.customPassword')}}</a-radio>
            </a-radio-group>
            <div class="relative inline-block">
              <a-input class="mx-1" style="width: 140px;" v-model="customPassword" :disabled="!reserveMeetingPassword"/>
              <span class="text-black9 setting-label ml-0">{{$t('setting.conference.customPasswordNotice')}}</span>
            </div>
              <!-- <div>
                <a-switch  size="small" v-model="isRandomPassword"></a-switch>
                <span class="setting-label ml-1" >随机密码</span>
              </div>
              <div>
                <a-switch  size="small" v-model="isCustomPassword" class="mt-3"></a-switch>
                
             </div> -->
          </div>

          <div class="mt-3">
            <a-switch size="small" v-model="loginSelector"/>
            <span class="setting-label">{{$t('setting.conference.loginSelector')}}</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="dndWhenCalling"/>
            <span class="setting-label">{{$t('setting.conference.dndWhenCalling')}}</span>
          </div>
        </div>
      </div>
      <div>
        <div class="mt-10">
          <a-button type="primary">
            <span class="leading-tight px-1">{{$t('setting.conference.advancedSetting')}}</span>
          </a-button>
        </div>
      </div>
    </div>

  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';

export default {
  name : 'ConferenceSetting',
  data() {
    return {
      advanceEntryTimeRange : [ 5, 180 ],
    };
  },
  components : {
    AppHeader,
  },
  sketch : {
    ns    : 'setting1.conference',
    props : [ 'minWindowWhenSharing', 'maxWindowWhenWatchingSharing', 'enableGpu', 'shareComputerSound', 'preferredPictureFluency', 'autoSilence',
      'noticeWhenLeaving', 'selectedNotice', 'advanceEntryTime', 'instanceMeetingPassword', 'reserveMeetingPassword',
      'isRandomOrCustom', 'customPassword', 'dndWhenCalling', 'loginSelector' ],
  },
  deactivated() {
    this.$model.setting1.save('conference'); // 页面不显示的时候保存设置
  },
  destroyed() {
    this.$model.setting1.save('conference'); // 页面不显示的时候保存设置
  },
  
  methods : {
    checkAdvanceTime() {
      if (typeof this.advanceEntryTime !== 'number') {
        this.$message.error('您输入的提前入会时间有误！');
        this.advanceEntryTime = 5;
      }
      else if (this.advanceEntryTime < this.advanceEntryTimeRange[0]) {
        this.$message.warning('您输入的提前入会时间太短！');
        this.advanceEntryTime = this.advanceEntryTimeRange[0];
      }
      else if (this.advanceEntryTime > this.advanceEntryTimeRange[1]) {
        this.$message.warning('您输入的提前入会时间太长！');
        this.advanceEntryTime = this.advanceEntryTimeRange[1];
      }
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
