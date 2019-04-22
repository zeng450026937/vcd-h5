<template>
  <a-layout id="enter-meeting" class="h-full">
    <app-header title="加入会议"/>
    <div class="flex justify-center items-center h-full" style="padding: 16px;">
      <div style="width: 480px;height: 518px;box-shadow: 0 4px 20px 0 rgba(0,0,0,0.12);"
           class="flex flex-col bg-white w-full h-full relative"
           @keyup.enter="enterMeeting">
        <div class="relative flex bg-media h-full">
          <video-view v-if="meetingInfo.initialVideo" class="w-full h-full"
                      muted
                      object-fit="cover"/>
          <div v-else class="local-video-bg flex flex-grow flex-col items-center justify-center">
            <a-iconfont type="icon-shipinjinyong" class="display-icon"></a-iconfont>
          </div>
          <div class="controls-content flex self-end w-full justify-center">
            <div class="flex mb-4">
              <a-button shape="circle"
                        :title="videoIcon.title"
                        class="controls-btn text-lg w-10 h-10 border-transparent"
                        :class="{[`bg-${videoIcon.color}`] : true}"
                        @click="triggerVideo"
              >
                <a-iconfont :type="videoIcon.icon" class="text-white"></a-iconfont>
              </a-button>
              <a-button shape="circle"
                        class="controls-btn text-lg w-10 h-10 mx-4 border-transparent"
                        :title="audioIcon.title"
                        :class="{[`bg-${audioIcon.color}`] : true}"
                        @click="triggerAudio"
              >
                <a-iconfont :type="audioIcon.icon"
                            class="text-white"></a-iconfont>
              </a-button>
            </div>
          </div>
        </div>
        <div class="join-meeting-form" v-show="!showSetting">
          <div class="join-meeting-form-header">
            <div>输入会议号码</div>
            <div>
              <a-iconfont
                  type="icon-kongzhi"
                  class="text-white cursor-pointer"
                  @click="showSetting = true">
              </a-iconfont>
            </div>
          </div>
          <div class="flex flex-col items-center">
            <div class="mt-5 w-full">
              <a-auto-complete
                  :value="meetingInfo.number"
                  class="certain-category-search w-full overflow-x-hidden"
                  :dropdownMatchSelectWidth="false"
                  optionLabelProp="value"
                  @select="selectAccount"
                  @search="searchAccount"
              >
                <template v-if="searchedAccounts.length > 0" slot="dataSource">
                  <a-select-opt-group>
                    <div class="select-opt-label flex justify-between px-3 border-b" slot="label">
                      <span>历史记录</span>
                      <span class="text-red cursor-pointer" @click="clearAccount">清空</span>
                    </div>
                    <a-select-option v-for="(item, index) in searchedAccounts"
                                     :key="index" :value="item.number" class="group">
                      <div class="flex items-center px-2 py-2">
                        <span class="certain-search-item-count">{{item.number}}</span>
                        <div class="flex flex-grow"></div>
                        <a-iconfont
                            type="icon-guanbi"
                            class="flex text-red opacity-0 group-hover:opacity-100"
                            @click.stop="deleteAccount(item)"
                        ></a-iconfont>
                      </div>
                    </a-select-option>
                  </a-select-opt-group>
                </template>
                <a-input placeholder='会议 ID'
                         maxlength="64"
                         @change="onNumberChange">
                  <a-iconfont slot="prefix" type="icon-dianhua" class="text-base text-black9"/>
                </a-input>
              </a-auto-complete>
            </div>

            <div class="mt-5 w-full">
              <a-input
                  :value="meetingInfo.pin"
                  maxlength="64"
                  placeholder='会议密码'
                  type="password"
                  @change="onPasswordChange"
              >
                <a-iconfont slot="prefix" type='icon-mima' class="text-base text-black9"/>
              </a-input>
            </div>
            <a-button type="primary" class="mt-16" block
                      :disabled="isConnected"
                      @click="enterMeeting">
              加入
            </a-button>
          </div>
        </div>
        <div class="meeting-setting-form" v-show="showSetting">
          <div class="back-btn">
            <a-iconfont type="icon-left"
                        title="返回"
                        class="cursor-pointer pl-3"
                        @click="showSetting = false">
            </a-iconfont>
          </div>
          <media-content
              text-color="text-white"
              :background="'setting-bg'"
              :showVideo="false"
              class="media-content text-white"/>
        </div>
      </div>

    </div>
  </a-layout>
</template>

<script>
import { cloneDeep, debounce } from 'lodash';
import AppHeader from '../../../components/Main/MainHeader.vue';
import MediaContent from '../../../components/Conference/TabSettingMedia.vue';
import VideoView from '../../../components/Common/VideoView.vue';
import { debounceNotice } from '../../../model/middleware/error-message';

export default {
  name       : 'EnterMeeting',
  components : {
    AppHeader,
    MediaContent,
    VideoView,
  },
  computed : {
    isCloud() {
      return this.$model.account.serverType === 'cloud';
    },
    server() {
      return this.$model.account.loginData.server;
    },
    isConnected() {
      return this.$rtc.conference.connected;
    },
    videoIcon() {
      return this.meetingInfo.initialVideo ? {
        title : '关闭摄像头',
        icon  : 'icon-shipin',
        color : '',
      } : {
        title : '打开摄像头',
        icon  : 'icon-shipinjinyong',
        color : 'red-light',
      };
    },
    audioIcon() {
      return this.meetingInfo.initialAudio
        ? {
          title : '关闭麦克风',
          icon  : 'icon-maikefeng',
          color : '',
        } : {
          title : '打开麦克风',
          icon  : 'icon-maikefengjinyong',
          color : 'red-light',
        };
    },
  },
  data() {
    const dSearch = debounce((val = '') => {
      this.searchedAccounts = this.modifiedAccounts.filter((a) => a.number.indexOf(val) >= 0);
    }, 200);

    
    return {
      dSearch,
      meetingInfo : {
        number       : '',
        pin          : '',
        initialVideo : true,
        initialAudio : false,
      }, // number pin
      rawAccounts      : [],
      modifiedAccounts : [],
      searchedAccounts : [],
      enterPopup       : null,
      showSetting      : false,
      meetingIDError   : false,
    };
  },
  mounted() {
    this.initRawAccounts();
  },
  methods : {
    checkNumber() {
      let errorNotice = '';

      const { length } = this.meetingInfo.number || '';

      if (length === 0) errorNotice = '会议ID不能为空';
      else if (length > 64) errorNotice = '会议ID最多为64位';
      else if (!this.isCloud && length !== 5) errorNotice = 'YMS账号会议ID仅支持五位数字输入';
      else if (this.isCloud && length !== 5 && length !== 10) errorNotice = 'Cloud账号会议ID仅支持5位或者10位数字输入';
      if (errorNotice) debounceNotice(this, errorNotice);
      
      return !errorNotice;
    },
    onNumberChange(e) {
      const { value } = e.target;
      const reg = /^[0-9]+$/;

      if (reg.test(value) || value === '') {
        if (value.length <= 64) {
          this.meetingInfo.number = value;
        }
      }
    },
    onPasswordChange(e) {
      const { value } = e.target;
      const reg = /^[0-9]+$/;

      if (reg.test(value) || value === '') {
        this.meetingInfo.pin = value;
      }
    },
    enterMeeting() {
      this.meetingIDError = !this.checkNumber();
      if (!this.meetingIDError) {
        this.$dispatch('meeting.joinMeeting', this.meetingInfo);
      }
    },
    cancelEnter() {
      this.$rtc.conference.leave();
    },
    triggerAudio() {
      this.meetingInfo.initialAudio = !this.meetingInfo.initialAudio;
    },
    triggerVideo() {
      this.meetingInfo.initialVideo = !this.meetingInfo.initialVideo;
    },
    deleteAccount(val) {
      this.$storage.deleteItem(`MEETING_INFO_RECORD_${this.$rtc.account.username}`, val.number, 'number');
      this.initRawAccounts();
    },
    clearAccount() {
      this.$storage.deleteItem(`MEETING_INFO_RECORD_${this.$rtc.account.username}`, this.rawAccounts.map((account) => account.id));
      this.initRawAccounts();
    },
    selectAccount(val) {
      Object.assign(this.meetingInfo, {
        number : '',
        pin    : '',
      }, this.modifiedAccounts.find((a) => a.number === val),
      {
        initialVideo : true,
        initialAudio : false,
      });
    },
    searchAccount(val) {
      this.dSearch(val.trim());
    },
    initRawAccounts() {
      this.rawAccounts = (this.$storage.query(`MEETING_INFO_RECORD_${this.$rtc.account.username}`) || []); // 得到最初的登陆历史记录
      this.modifyAccounts();
    },
    modifyAccounts() {
      this.modifiedAccounts = this.rawAccounts
        .sort((account1, account2) => account2.lastDate - account1.lastDate);
      this.modifiedAccounts = cloneDeep(this.modifiedAccounts.slice(0, 10)) || [];
      const account = this.modifiedAccounts[0] || {};

      this.meetingInfo = {
        number       : account.number,
        pin          : account.pin,
        initialVideo : true,
        initialAudio : false,
      };
      this.dSearch();
    },
  },
};
</script>

<style lang="less">
  #enter-meeting {
    .meeting-error {
      border-color: red;
    }
    .controls-content {
      button{
        box-shadow: 0 0 8px 0 rgba(255,255,255,0.30);
      }
    }
    .ant-input {
      padding-left: 36px;
    }
    .controls-btn {
      background: rgba(0,0,0,0.65);
    }
    .local-video-bg {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      .display-icon {
        opacity: 0.4;
        color: white;
        font-size: 84px;
      }
    }
    .media-content{
      .video-content {
        height: 158px !important;
      }
    }
    .join-meeting-form {
      position: absolute;
      width: 280px;
      height: 300px;
      padding: 20px;
      right: 20px;
      top: 25%;
      background: rgba(0,0,0,0.65);
      box-shadow: 0 4px 20px 0 rgba(0,0,0,0.12);
      .join-meeting-form-header{
        color: #FFFFFF;
        padding: 12px 0;
        font-size: 16px;
        display: flex;
        justify-content: space-between;
      }
    }
    .meeting-setting-form {
      width:280px;
      padding: 10px 0 24px 0;
      background: rgba(0,0,0,0.65);
      box-shadow: 0 4px 20px 0 rgba(0,0,0,0.12);
      position: absolute;
      right: 20px;
      top: 20%;
      .back-btn {
        padding: 10px 0;
        color: #FFFFFF;
        font-weight: bold;
      }
      .setting-bg {
        background: rgba(0,0,0,0);
      }
    }
  }
</style>
