<template>
  <a-layout id="enter-meeting" class="h-full">
    <app-header title="加入会议"/>
    <div class="flex justify-center items-center h-full">
      <div  v-if="!showSetting"
            style="width: 480px;height: 518px;box-shadow: 0 4px 20px 0 rgba(0,0,0,0.12);"
           class="flex flex-col bg-white"
           @keyup.enter="enterMeeting">
        <div style="height: 270px;"
             class="relative flex bg-media">
          <video-view v-if="meetingInfo.initialVideo" class="w-full h-full"
                      muted
                      object-fit="cover"/>
          <div v-else class="local-video-bg flex flex-grow flex-col items-center justify-center">
            <a-iconfont type="icon-shipinjinyong" class="display-icon"/>
          </div>
          <div class="controls-content flex self-end w-full justify-center">
            <div class="flex mb-4">
              <a-button shape="circle"
                        :title="videoIcon.title"
                        class="controls-btn text-lg w-10 h-10 border-transparent"
                        :class="{[`bg-${videoIcon.color}`] : true}"
                        @click="triggerVideo"
              >
                <a-iconfont :type="videoIcon.icon" class="text-white"/>
              </a-button>
              <a-button shape="circle"
                        class="controls-btn text-lg w-10 h-10 mx-4 border-transparent"
                        :title="audioIcon.title"
                        :class="{[`bg-${audioIcon.color}`] : true}"
                        @click="triggerAudio"
              >
                <a-iconfont :type="audioIcon.icon"
                            class="text-white"/>
              </a-button>
              <a-button shape="circle"
                        title="设置"
                        class="controls-btn text-lg w-10 h-10 border-transparent"
                        @click="showSetting = true"
              >
                <a-iconfont type="icon-kongzhi" class="text-white"/>
              </a-button>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center px-24 bg-white">
          <div class="mt-5 w-full">
            <a-input
                placeholder='会议 ID'
                :class="{'meeting-error': meetingIDError}"
                :value="meetingInfo.number"
                @change="onNumberChange"
            >
              <a-iconfont v-number-only slot="prefix" type='icon-ID' class="text-base text-black9"/>
            </a-input>
          </div>

          <div class="mt-5 w-full">
            <a-input
                :value="meetingInfo.pin"
                placeholder='会议密码'
                type="password"
                @change="onPasswordChange"
            >
              <a-iconfont slot="prefix" type='icon-mima' class="text-base text-black9"/>
            </a-input>
          </div>
          <div class="mt-5 w-full">
            <a-input
                :value="server"
                read-only
                lder='服务器地址'
            >
              <a-iconfont slot="prefix" type='icon-fuwuqi' class="text-base text-black9"/>
            </a-input>
          </div>
          <a-button type="primary" class="mt-10" block
                    :disabled="isConnected"
                    @click="enterMeeting">立即加入</a-button>
        </div>
      </div>
      <div v-else style="width: 480px;height: 518px;box-shadow: 0 4px 20px 0 rgba(0,0,0,0.12);"
           class="flex flex-col bg-white">
        <div class="mt-5 px-20 relative">
          <!--返回按钮区域-->
          <div class="absolute" style="left: 20px; top: 3px">
            <a-iconfont type="icon-left"
                        title="返回"
                        class="cursor-pointer text-black9"
                        @click="showSetting = false"/>
          </div>
          <media-content class="media-content text-black3"/>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';
import MediaContent from '../../Conference/TabSettingMedia.vue';
import VideoView from '../../Common/VideoView.vue';

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
    return {
      meetingInfo    : this.$model.meeting.meetingRecord, // number pin
      enterPopup     : null,
      showSetting    : false,
      meetingIDError : false,
    };
  },
  methods : {
    checkNumber() {
      let errorNotice = '';

      const { length } = this.meetingInfo.number || '';

      if (length === 0) errorNotice = '会议ID不能为空';
      else if (length > 64) errorNotice = '会议ID最多为64位';
      else if (!this.isCloud && length !== 5) errorNotice = 'YMS账号会议ID仅支持五位数字输入';
      else if (this.isCloud && length !== 5 && length !== 10) errorNotice = 'Cloud账号会议ID仅支持5位或者10位数字输入';
      if (errorNotice) this.$message.error(errorNotice);
      
      return !errorNotice;
    },
    onNumberChange(e) {
      const { value } = e.target;
      const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;

      if ((!Number.isNaN(value) && reg.test(value)) || value === '') {
        if (value.length <= 64) {
          this.meetingInfo.number = value;
        }
      }
    },
    onPasswordChange(e) {
      const { value } = e.target;
      const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;

      if ((!Number.isNaN(value) && reg.test(value)) || value === '') {
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
  }
</style>
