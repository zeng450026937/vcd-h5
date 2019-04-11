<template>
  <a-layout id="meeting-content" class="bg-media h-full absolute w-full">
    <div class="h-full z-10 flex flex-col">
      <div class="flex h-full flex-col justify-center absolute pin-t w-full">
        <div v-if="!isInSetting" class="enter-meeting-content mr-5 self-end rounded-sm">
          <div class="flex justify-end">
            <a-iconfont type='icon-kongzhi'
                        title="设置"
                        class="text-lg cursor-pointer text-white"
                        @click="isInSetting = true"/>
          </div>
          <div class="p-4">
            <h2 class="text-white">加入会议</h2>
            <div class="mt-10 flex flex-col">
              <div class="input-with-icon">

                <a-auto-complete
                    class="certain-category-search w-full overflow-x-hidden"
                    :value="meetingInfo.number"
                    :dropdownMatchSelectWidth="false"
                    optionLabelProp="value"
                    @select="selectAccount"
                    @search="searchAccount"
                    @change="onAccountChange"
                >
                  <template v-if="searchedAccounts.length > 0" slot="dataSource">
                    <a-select-opt-group>
                      <div class="flex justify-between px-3 border-b" slot="label">
                        <span>历史记录</span>
                        <span class="text-red cursor-pointer" @click="clearAccount">清空</span>
                      </div>
                      <a-select-option v-for="item in searchedAccounts"
                                       :key="item.number" :value="item.number" class="group">
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
                  <a-input placeholder='会议ID'
                           :class="{'meeting-error': meetingIDError}">
                    <a-iconfont slot="prefix" type="icon-dianhua" class="text-base text-black9"/>
                  </a-input>
                </a-auto-complete>

              </div>
              <div class="mt-4 input-with-icon">
                <a-input
                    placeholder='会议密码'
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
                    placeholder='服务器地址'
                >
                  <a-iconfont slot="prefix" type='icon-fuwuqi' class="text-base text-black9"/>
                </a-input>
              </div>
              <div class="mt-4 input-with-icon">
                <a-input
                    placeholder='您在会议中的名称'
                    :value="meetingInfo.displayName"
                    @change="onDisplayNameChange"
                >
                  <a-iconfont slot="prefix" type='icon-ren' class="text-base text-black9"/>
                </a-input>
              </div>

              <div class="mt-5 input-with-icon">
                <div class="flex text-white justify-end items-center">
                  <div class="cursor-pointer" @click="isProxyPanelVisible = !isProxyPanelVisible">
                    <span>代理服务器</span>
                    <a-iconfont :type="isProxyPanelVisible ? 'icon-up' : 'icon-down'" class="ml-2"></a-iconfont>
                  </div>
                </div>
              </div>

              <div v-if="isProxyPanelVisible" class="mt-3 mb-5 input-without-icon flex justify-between">
                <a-input
                    v-model="meetingInfo.proxy"
                    placeholder='代理服务器地址'
                    style="width: 188px;"
                >
                </a-input>
                <a-input
                    :value="meetingInfo.proxyPort"
                    @change="onProxyPortChange"
                    v-number-only
                    placeholder='端口'
                    style="width: 76px;"
                >
                </a-input>
              </div>

            </div>
            <div class="mt-5 flex flex-col">
              <a-button type="primary"
                        @click="joinMeeting">加入</a-button>
              <a-button block class="mt-4" @click="returnLogin">返回登录</a-button>
            </div>
          </div>
        </div>
        <div v-else class="setting-content self-end rounded-sm mr-5">
          <div class="text-white">
            <a-iconfont type="icon-left"
                        title="返回"
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
                class="z-0 bg-media"/>
    <div v-else class="local-video-bg flex flex-grow flex-col items-center justify-center">
      <a-iconfont type="icon-shipinjinyong" class="display-icon"/>
    </div>
  </a-layout>
</template>

<script>
import { cloneDeep, debounce } from 'lodash';
import TabSettingMedia from '../../components/Conference/TabSettingMedia.vue';
import VideoView from '../../components/Common/VideoView.vue';
import { LOGIN_STORAGE } from '../../storage/constants';
import { debounceNotice } from '../../model/middleware/error-message';

export default {
  name       : 'YMAMeeting',
  components : {
    TabSettingMedia,
    VideoView,
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
        number       : '20017',
        pin          : '548194',
        displayName  : 'AAA',
        server       : 'academia.com',
        proxy        : '10.200.112.165',
        proxyPort    : '5061',
        initialVideo : true,
        initialAudio : true,
      },
      rawAccounts      : [],
      modifiedAccounts : [],
      searchedAccounts : [],
      meetingIDError   : false,
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
      return this.meetingInfo.initialAudio ? {
        title : '关闭麦克风',
        icon  : 'icon-maikefeng',
        color : '' } : {
        title : '打开麦克风',
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
    joinMeeting() {
      // this.$dispatch('meeting.anonymousJoin', this.meetingInfo);
      this.meetingIDError = !this.checkNumber();
      if (!this.meetingIDError) {
        this.$dispatch('meeting.anonymousJoin', this.meetingInfo);
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
      this.$storage.deleteItem(LOGIN_STORAGE.MEETING_ACCOUNT_LIST, val.number, 'number');
      this.initRawAccounts();
    },
    clearAccount() {
      this.$storage.deleteItem(LOGIN_STORAGE.MEETING_ACCOUNT_LIST, this.rawAccounts.map((account) => account.id));
      this.initRawAccounts();
    },
    selectAccount(val) {
      Object.assign(this.meetingInfo, {
        number       : '',
        pin          : '',
        server       : this.serverType === 'cloud' ? 'yealinkvc.com' : '',
        displayName  : '',
        proxy        : '',
        proxyPort    : '',
        initialVideo : true,
        initialAudio : true,
      }, this.modifiedAccounts.find((a) => a.number === val));
    },
    searchAccount(val) {
      this.dSearch(val.trim());
    },
    initRawAccounts() {
      this.rawAccounts = (this.$storage.query(LOGIN_STORAGE.MEETING_ACCOUNT_LIST) || []); // 得到最初的登陆历史记录
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
        server       : this.serverType === 'cloud' ? 'yealinkvc.com' : '',
        displayName  : '',
        proxy        : '',
        proxyPort    : '',
        initialVideo : true,
        initialAudio : true,
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
