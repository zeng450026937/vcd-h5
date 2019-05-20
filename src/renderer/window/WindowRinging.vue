<template>
  <a-layout id="window" class="h-full bg-white">
    <div class="flex flex-col h-full wrapper">
      <div class="header">
        <a-iconfont type="icon-guanbi" class="close hover:bg-red-light hover:text-white header-control"
                    :title="$t('common.controls.close')"
                    @click="hangUp"></a-iconfont>
      </div>
      <div class="flex flex-grow content mt-3">
        <div class="flex h-12 w-full">
          <a-avatar :size="48" class="target-avatar">
            <span v-if="conferenceInviter">{{this.displayName.substr(-2,2)}}</span>
            <a-iconfont v-else type="icon-huiyishi"/>
          </a-avatar>
          <div class="flex flex-col ml-5 truncate w-1 flex-grow">
            <div class="truncate text-base leading-none font-bold">
              {{this.displayName}}
            </div>
            <span class="text-base leading-none mt-4">{{ringText}}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-center mt-4 self-end mb-4 mr-4">
        <!--麦克风（接听）-->
        <a-button v-if="isVideoCall || conferenceInviter"
                  class="text-base flex items-center"
                  style="max-width: 160px"
                  :title="$t('conversation.controls.changeToAudio')"
                  @click="transferToAudio">
          <a-iconfont type="icon-qiehuan"/>
          <span class="truncate">{{$t('conversation.controls.changeToAudio')}}</span>
        </a-button>
        <!--麦克风（接听）-->
        <a-button class="text-base w-14 ml-3 text-white border-transparent"
                  type="primary"
                  @click="answerCall(false)">
          <a-iconfont type="icon-yuyin"/>
        </a-button>
        <!--挂断-->
        <a-button class="text-base w-14 text-white ml-3 bg-red-light border-transparent"
                  @click="hangUp">
          <a-iconfont type="icon-guaduan"/>
        </a-button>
      </div>
    </div>
  </a-layout>
</template>

<script>
import { remote } from 'electron';

export default {
  name : 'WindowRinging',
  data() {
    return {
      subject : '',
      number  : '',
    };
  },
  computed : {
    ringText() {
      return this.conferenceInviter
        ? this.number
        : this.isVideoCall
          ? this.$t('conversation.invite.videoCallInvite')
          : this.$t('conversation.invite.audioCallInvite');
    },
    rtc() {
      return (window.opener && window.opener.rtc) || window.rtc;
    },
    $t() {
      return this.kom.vm.i18n.t;
    },
    kom() {
      return (window.opener && window.opener.kom) || window.kom;
    },
    displayName() {
      if (this.conferenceInviter) return this.subject;
      const { remoteIdentity } = this.rtc.call.incoming[0];

      return (remoteIdentity && (remoteIdentity.display_name
        || remoteIdentity.uri.user)) || this.$t('conversation.title.unknownUser');
    },
    isVideoCall() {
      if (this.conferenceInviter) return false;
      const { callType } = this.rtc.account.newChannel[0]; // 只考虑一路

      return callType && callType === 'video';
    },
    conferenceInviter() {
      const { headers } = this.rtc.call.incoming[0].request;
      
      return headers && headers['Apollo-Conference-Inviter'];
    },
  },
  mounted() {
    window.updatePosition = this.updatePosition;
    setInterval(() => {
      this.checkStatus();
    }, 1000);
    if (this.conferenceInviter) {
      this.number = this.rtc.account.newChannel[0].request.headers['Apollo-Conference-Number'][0].raw;

      this.rtc.conference.cm.command('getConferenceByConfNumber')(this.number).then((val) => {
        this.subject = val['conference-info']['conference-description'].subject;
      });
    }
  },
  beforeDestroy() {
    window.updatePosition = null;
  },
  methods : {
    updatePosition(y) {
      const browserWindow = remote.getCurrentWindow();
      const [ currentX ] = browserWindow.getPosition();

      setTimeout(() => {
        browserWindow.setPosition(currentX, y, true);
      }, 300);
    },
    hangUp() {
      this.kom.dispatch('call.decline');
    },
    answerCall(toAudio = false) {
      if (!this.rtc.call.ringing) return;
      this.kom.dispatch('call.answer',
        {
          toAudio,
          isVideoCall : this.isVideoCall,
          isInvite    : this.conferenceInviter,
        });
    },
    transferToAudio() {
      this.answerCall(true);
    },
    checkStatus() {
      try {
        if (!this.rtc.call.ringing) {
          this.close();
        }
      }
      catch (e) {
        window.close();
      }
    },
    close() {
      const notify = this.kom.vm.$getVM('notify');

      window.close();
      notify.$emit('ringing-close', window.id);
    },
  },
};
</script>

<style lang="less">
  #window {
    .wrapper {
      .content{
        padding: 0 20px 20px 20px ;
      }

      .header {
        height: 35px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        .header-control {
          color: #666666;
          &:hover {
            background: #e5e5e5;
            color: #000000;
          }
          transition: all .2s ease-in-out;
          @apply text-base w-12 cursor-pointer flex items-center justify-center;
        }
      }
    }
  }
</style>
