<template>
  <a-layout id="enter-meeting" class="h-full">
    <div class="h-14 border-b">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>加入会议</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <div class="flex justify-center items-center h-full">
      <div  v-if="!showSetting"
            style="width: 480px;height: 518px;box-shadow: 0 4px 20px 0 rgba(0,0,0,0.12);"
           class="flex flex-col bg-white"
           @keyup.enter="enterMeeting">
        <div style="height: 270px;"
             class="relative flex bg-media">
          <video-view v-if="!muteVideo" class="w-full h-full"
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
                placeholder='Meeting ID'
                :value="meetingInfo.number"
                @change="onNumberChange"
            >
              <a-iconfont v-number-only slot="prefix" type='icon-ID' class="text-base text-black9"/>
            </a-input>
          </div>

          <div class="mt-5 w-full">
            <a-input
                :value="meetingInfo.pin"
                placeholder='Password(Optional)'
                type="password"
                @change="onPasswordChange"
            >
              <a-iconfont slot="prefix" type='icon-mima' class="text-base text-black9"/>
            </a-input>
          </div>
          <div class="mt-5 w-full">
            <a-input
                v-model="meetingInfo.server"
                placeholder='Server address'
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
    isConnected() {
      return this.$rtc.conference.connected;
    },
    muteAudio : {
      get() {
        return this.$rtc.media.localMedia.muteAudio;
      },
      set(val) {
        this.$rtc.media.localMedia.muteAudio = val;
      },
    },
    muteVideo : {
      get() {
        return this.$rtc.media.localMedia.muteVideo;
      },
      set(val) {
        this.$rtc.media.localMedia.muteVideo = val;
      },
    },
    videoIcon() {
      return this.muteVideo ? {
        title : '打开摄像头',
        icon  : 'icon-shipinjinyong',
        color : 'red-light',
      } : {
        title : '关闭摄像头',
        icon  : 'icon-shipin',
        color : '',
      };
    },
    audioIcon() {
      return this.muteAudio ? {
        title : '打开麦克风',
        icon  : 'icon-maikefengjinyong',
        color : 'red-light',
      } : {
        title : '关闭麦克风',
        icon  : 'icon-maikefeng',
        color : '',
      };
    },
  },
  data() {
    return {
      meetingInfo : this.$model.meeting.meetingRecord, // number pin
      enterPopup  : null,
      showSetting : false,
    };
  },
  methods : {
    checkNumber() {
      let errorNotice = '';

      if (!this.meetingInfo.number) errorNotice = '会议ID不能为空';
      else if (this.meetingInfo.number.length > 64) errorNotice = '会议ID最多为64位';
      this.$message.error(errorNotice);
      
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
      if (this.checkNumber()) {
        this.$dispatch('meeting.joinMeeting', this.meetingInfo);
      }
    },
    cancelEnter() {
      this.$rtc.conference.leave();
    },
    triggerAudio() {
      this.muteAudio = !this.muteAudio;
    },
    triggerVideo() {
      this.muteVideo = !this.muteVideo;
    },

  },
};
</script>

<style lang="less">
  #enter-meeting {
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
