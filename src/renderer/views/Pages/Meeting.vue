<template>
  <a-layout id="meeting-content" class="bg-media h-full absolute w-full">

    <div class="h-full z-10 flex flex-col">
      <login-header :color="'white'"></login-header>
      <div class="flex h-full flex-col justify-center absolute pin-t w-full">
        <div v-if="!isInSetting" class="enter-meeting-content mr-5 self-end rounded-sm">
          <div class="flex justify-end">
            <a-iconfont type='icon-kongzhi'
                        :title="$t('nav.setting')"
                        class="text-lg cursor-pointer text-white"
                        @click="isInSetting = true"/>
          </div>
          <div class="p-4" @keyup.enter="joinMeeting">
            <h2 class="text-white">{{$t('nav.joinMeeting')}}</h2>
            <div class="mt-10 flex flex-col">
              <div class="input-with-icon">
                <account-auto-complete
                    :account="meetingInfo.number"
                    :searched-accounts="searchedAccounts"
                    label="number"
                    prefix-icon="icon-ID"
                    :placeholder="$t('join.placeholder.conferenceId')"
                    @clearAccount="clearAccount"
                    @updateAccount="updateAccount"
                    @selectAccount="selectAccount"
                    @searchAccount="searchAccount"
                    @deleteAccount="deleteAccount"
                ></account-auto-complete>

              </div>
              <div class="mt-4 input-with-icon">
                <a-input
                    :placeholder="$t('join.placeholder.password')"
                    maxlength="64"
                    type='password'
                    :value="meetingInfo.pin"
                    @change="onPasswordChange"
                >
                  <a-iconfont slot="prefix" type='icon-mima' class="text-base text-black9"/>
                </a-input>
              </div>
              <div class="mt-4 input-with-icon">
                <a-input
                    v-model="meetingInfo.server"
                    maxlength="64"
                    :placeholder="$t('join.placeholder.serverAddress')"
                >
                  <a-iconfont slot="prefix" type='icon-fuwuqi' class="text-base text-black9"/>
                </a-input>
              </div>
              <div class="mt-4 input-with-icon">
                <a-input
                    :placeholder="$t('join.placeholder.displayName')"
                    maxlength="64"
                    :value="meetingInfo.displayName"
                    @change="onDisplayNameChange"
                >
                  <a-iconfont slot="prefix" type='icon-ren' class="text-base text-black9"/>
                </a-input>
              </div>

              <div class="mt-5 input-with-icon">
                <div class="flex text-white justify-end items-center">
                  <div class="cursor-pointer" @click="isProxyPanelVisible = !isProxyPanelVisible">
                    <span>{{$t('join.title.proxyServer')}}</span>
                    <a-iconfont :type="isProxyPanelVisible ? 'icon-up' : 'icon-down'" class="ml-2"></a-iconfont>
                  </div>
                </div>
              </div>

              <div v-if="isProxyPanelVisible" class="mt-3 mb-5 input-without-icon flex justify-between">
                <a-input
                    v-model="meetingInfo.proxy"
                    maxlength="64"
                    :placeholder="$t('join.placeholder.proxyAddress')"
                    style="width: 188px;"
                >
                </a-input>
                <a-input
                    :value="meetingInfo.proxyPort"
                    @change="onProxyPortChange"
                    :placeholder="$t('join.placeholder.port')"
                    style="width: 76px;"
                >
                </a-input>
              </div>

            </div>
            <div class="mt-5 flex flex-col">
              <a-button type="primary"
                        @click="joinMeeting">{{$t('join.title.join')}}</a-button>
              <a-button block class="mt-4" @click="returnLogin">{{$t('join.title.backToLogin')}}</a-button>
            </div>
          </div>
        </div>
        <div v-else class="setting-content self-end rounded-sm mr-5">
          <div class="text-white">
            <a-iconfont type="icon-left"
                        :title="$t('join.title.back')"
                        class="cursor-pointer text-base"
                        @click="isInSetting = false"/>
          </div>
          <div class="setting-media-content m-4">
            <tab-setting-media :show-video="false"/>
          </div>
        </div>
      </div>
      <div class="flex flex-grow"></div>
      <div class="controls-content flex justify-center pb-5">
        <a-button shape="circle"
                  class="controls-btn text-lg w-10 h-10 border-transparent"
                  :title="videoIcon.title"
                  :class="{[`bg-${videoIcon.color}`] : true}"
                  @click="triggerVideo">
          <a-iconfont :type="videoIcon.icon" class="text-white"/>
        </a-button>
        <a-button class="controls-btn text-lg w-10 h-10 ml-3 border-transparent"
                  :title="audioIcon.title"
                  :class="{[`bg-${audioIcon.color}`] : true}"
                  shape="circle"
                  @click="triggerAudio">
          <a-iconfont :type="audioIcon.icon" class="text-white"/>
        </a-button>
      </div>
    </div>
    <video-view v-if="meetingInfo.initialVideo"
                object-fit="cover"
                muted
                ignore-static-video
                class="z-0 bg-media"/>
    <div v-else class="local-video-bg flex flex-grow flex-col items-center justify-center">
      <a-iconfont type="icon-shipinjinyong" class="display-icon"/>
    </div>
  </a-layout>
</template>

<script>
import { cloneDeep, debounce } from 'lodash';
import TabSettingMedia from '../../components/Conference/TabSettingMedia.vue';
import LoginHeader from '../../components/Login/LoginHeader.vue';
import VideoView from '../../components/Common/VideoView.vue';
import { LOGIN_STORAGE } from '../../storage/constants';
import { debounceNotice } from '../../model/middleware/error-message';
import AccountAutoComplete from '../../components/Login/AccountAutoComplete.vue';

export default {
  name       : 'YMAMeeting',
  components : {
    TabSettingMedia,
    VideoView,
    LoginHeader,
    AccountAutoComplete,
  },
  data() {
    const dSearch = debounce((val = '') => {
      this.searchedAccounts = this.modifiedAccounts.filter((a) => a.number.indexOf(val) >= 0);
    }, 200);

    return {
      dSearch,
      showProxyItem       : false,
      isInSetting         : false,
      isProxyPanelVisible : false,
      meetingInfo         : {
        number       : '',
        pin          : '',
        displayName  : '',
        server       : '',
        proxy        : '',
        proxyPort    : '',
        initialVideo : true,
        initialAudio : false,
      },
      rawAccounts      : [],
      modifiedAccounts : [],
      searchedAccounts : [],
      meetingInfoError : false,
    };
  },
  sketch : {
    ns    : 'account',
    props : [ 'loginType' ],
  },
  mounted() {
    this.initRawAccounts();
  },
  computed : {
    isCloud() {
      return this.$model.account.serverType === 'cloud';
    },
    serverType() {
      return this.$model.account.serverType;
    },
    localStream() {
      return this.$rtc.media.localMedia.stream;
    },
    videoIcon() {
      return this.meetingInfo.initialVideo ? {
        title : this.$t('conversation.controls.turnOffCamera'),
        icon  : 'icon-shipin',
        color : '',
      } : {
        title : this.$t('conversation.controls.turnOnCamera'),
        icon  : 'icon-shipinjinyong',
        color : 'red-light',
      };
    },
    audioIcon() {
      return this.meetingInfo.initialAudio ? {
        title : this.$t('conversation.controls.turnOffMicrophone'),
        icon  : 'icon-maikefeng',
        color : '',
      } : {
        title : this.$t('conversation.controls.turnOnMicrophone'),
        icon  : 'icon-maikefengjinyong',
        color : 'red-light',
      };
    },
    meetingBtnClasses() {
      return {};
    },
    isConnecting() {
      return this.$rtc.conference.connecting;
    },
  },
  methods : {
    checkMeetingInfo() {
      let errorNotice = '';

      switch (true) {
        case !this.meetingInfo.number:
          errorNotice = this.$t('join.message.conferenceIdNoEmpty');
          break;
        case !this.meetingInfo.server:
          errorNotice = this.$t('join.message.serverAddressNoEmpty');
          break;
        case !this.meetingInfo.displayName:
          errorNotice = this.$t('join.message.displayNameNoEmpty');
          break;
        default: break;
      }

      if (errorNotice) debounceNotice(this, errorNotice);

      return !errorNotice;
    },
    onAccountChange(value) {
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
    onDisplayNameChange(e) {
      const { value } = e.target;

      if (value.length <= 64) {
        this.meetingInfo.displayName = value;
      }
    },
    onProxyPortChange(e) {
      const { value } = e.target;

      if (value.length <= 5) {
        this.meetingInfo.proxyPort = value;
      }
    },
    async joinMeeting() {
      this.meetingInfoError = !this.checkMeetingInfo();
      if (!this.meetingInfoError) {
        await this.$dispatch('meeting.anonymousJoin', this.meetingInfo);
      }
    },
    returnLogin() {
      this.loginType = 'login';
    },
    handleMeeting() {
    },
    triggerAudio() {
      this.meetingInfo.initialAudio = !this.meetingInfo.initialAudio;
    },
    triggerVideo() {
      this.meetingInfo.initialVideo = !this.meetingInfo.initialVideo;
    },
    deleteAccount(val) {
      this.$storage.deleteItem(LOGIN_STORAGE.ANON_MEETING_ACCOUNT_LIST, val.number, 'number');
      this.initRawAccounts();
    },
    clearAccount() {
      this.$storage.deleteItem(LOGIN_STORAGE.ANON_MEETING_ACCOUNT_LIST, this.rawAccounts.map((account) => account.id));
      this.initRawAccounts();
    },
    updateAccount(val) {
      this.meetingInfo.number = val;
    },
    selectAccount(val) {
      Object.assign(this.meetingInfo, {
        number      : '',
        pin         : '',
        server      : this.serverType === 'cloud' ? 'yealinkcloud.cc' : '',
        displayName : '',
        proxy       : '',
        proxyPort   : '',
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
      this.rawAccounts = (this.$storage.query(LOGIN_STORAGE.ANON_MEETING_ACCOUNT_LIST) || []); // 得到最初的登陆历史记录
      this.modifyAccounts();
    },
    modifyAccounts() {
      this.modifiedAccounts = this.rawAccounts
        .filter((account) => account.type === this.serverType)
        .sort((account1, account2) => account2.lastLoginDate - account1.lastLoginDate);
      this.modifiedAccounts = cloneDeep(this.modifiedAccounts.slice(0, 10)) || [];
      this.meetingInfo = {
        number       : '',
        pin          : '',
        server       : this.serverType === 'cloud' ? 'yealinkcloud.cc' : '',
        displayName  : '',
        proxy        : '',
        proxyPort    : '',
        initialVideo : true,
        initialAudio : false,
      };
      this.dSearch();
    },
  },
  watch : {
    serverType() { // f服务器类型发生变化
      if (this.modifiedAccounts.length <= 0) { // 没有联系人则从数据库重新获取
        this.initRawAccounts();
      }
      else { // 重新设置 searchResult
        this.modifyAccounts();
      }
    },
    'meetingInfo.proxyPort' : function(val) {
      this.meetingInfo.proxyPort = val.replace(/\D+/, '');
    },
  },
};
</script>

<style lang="less">
  #meeting-content {
    z-index: 1;
    .meeting-error {
      border-color: red;
    }
    .controls-content {
      button{
        box-shadow: 0 0 8px 0 rgba(255,255,255,0.30);
      }
    }
    .enter-meeting-content, .setting-content {
      background-color: rgba(0, 0, 0, 0.65);
      width: 360px;
      padding: 20px;
    }

    .setting-content {
      padding-bottom: 108px;
      .setting-media-content {
        #tab-setting-media {
          background-color: transparent !important;
          color: white !important;

          > div {
            padding: 0 !important;
          }

          .test-mic-text {
            color: white !important;
          }

          .test-audio-text {
            color: white !important;
          }
        }
      }
    }
    .input-with-icon{
      .ant-input {
        padding-left: 36px;
      }
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
        font-size: 96px;
      }
    }
    #tab-setting-media {
      .ant-progress {
        .ant-progress-inner {
          background-color: rgba(153, 153, 153, 0.5);
          .ant-progress-bg {
            background-color: #FFF;
          }
        }
      }
    }
  }
</style>
