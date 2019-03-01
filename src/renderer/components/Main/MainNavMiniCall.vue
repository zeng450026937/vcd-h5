<template>
  <div id="main-nav-mini-call">
    <div class="relative" style="border: 1px solid #1D212F;">
      <div style="margin-bottom: 56px;" class="mt-4" @dblclick="expandMiniContent">
        <div v-if="isConnected" class="flex flex-grow flex-col items-center justify-center">
          <a-iconfont type="icon-huiyishi" class="display-icon"/>
        </div>
        <div v-else class="call-content flex flex-grow flex-col items-center justify-center">
          <div style="width: 80px;height: 80px"
               class="flex items-center justify-center target-avatar border-8 rounded-full">
            <span class="target-name">{{userName.substr(-2, 2)}}</span>
          </div>
        </div>
      </div>

      <div class="video-controls absolute w-full">
        <div class="h-full w-full flex flex-col">

          <div class="flex flex-grow"></div>
          <div class="flex justify-center py-3 items-center">
            <div class="button-content flex h-8 items-center z-10">
              <a-button shape="circle"
                        class="text-white mx-2 border-transparent"
              ><a-iconfont type="icon-maikefeng"/></a-button>

              <a-popover
                  trigger="click"
                  v-model="showMorePanel"
                  overlayClassName="more-panel-popover"
              >
                <div slot="content" class="popover-content">
                  <div class="h-8 w-full px-3 popover-content-item flex items-center hover:bg-grey-light">
                    <a-iconfont type="icon-yuyin" class="text-base text-indigo"/>
                    <span class="ml-3 text-xs">切换为音频通话</span>
                  </div>
                  <div class="h-8 w-full px-3 popover-content-item flex items-center hover:bg-grey-light">
                    <a-iconfont type="icon-bohao" theme="filled" class="text-base text-indigo"/>
                    <span class="ml-3 text-xs">拨号盘</span>
                  </div>
                </div>
                <a-button shape="circle"
                          class="text-white mx-2 border-transparent"
                          @click="showMorePanel = !showMorePanel"
                ><a-iconfont type="icon-gengduo1"/></a-button>
              </a-popover>
              <a-button shape="circle"
                        class="text-white mx-2 bg-red-light border-transparent"
                        @click="hangUp"
              ><a-iconfont type="icon-guaduan"/></a-button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { CALL } from '../../router/constants';

export default {
  name       : 'MainNavMiniCall',
  components : {
  },
  data() {
    return {
      showMorePanel : false,
    };
  },
  computed : {
    callText() {
      const titleMap = {
        connecting   : `正在呼叫 ${this.userName}`,
        connected    : `正在与 ${this.userName} 进行通话`,
        ringing      : `${this.userName} 正在来电`,
        disconnected : `与 ${this.userName} 的通话已结束`,
      };

      return titleMap[this.callStatus] || '当前通话已失效';
    },
    displayName() {
      const remoteIdentity = this.callStatus !== 'disconnected'
        ? this.$rtc.call.remoteIdentity
          || this.$rtc.call.incoming[0].remoteIdentity : null;

      return remoteIdentity && (remoteIdentity.display_name
          || remoteIdentity.uri.user);
    },
    userName() {
      return this.displayName || this.targetUser || '未知用户';
    },
    isInCallView : {
      get() {
        return this.$model.state.isInCallView;
      },
      set(val) {
        this.$model.state.isInCallView = val;
      },
    },
    callStatus() {
      return this.$model.state.callStatus;
    },
    isConnecting() {
      return this.$rtc.call.connecting;
    },
    isConnected() {
      return this.$rtc.call.connected;
    },
  },
  methods : {
    hangUp() {
      if (this.callStatus === 'ringing') {
        this.$rtc.call.decline().catch(() => {});
      }
      else {
        this.$rtc.call.disconnect();
      }
    },
    expandMiniContent() {
      this.$model.state.isInMiniCall = false;
      this.isInCallView = true;
      this.$router.push(CALL.CALL_MAIN);
    },
  },
  watch : {
    displayName(cur, once) {
      this.targetUser = cur || once;
    },
  },
};
</script>

<style lang="less">
  #main-nav-mini-call {
    background-color: rgb(31, 36, 55);
    .video-controls {
      top: 100%;
      transform: translateY(-100%);
      z-index: 1;
      .button-content {
        button {
          background: rgba(0,0,0,0.65);
        }
      }
    }
    .target-avatar {
      background-color: #55638C;
    }
    .target-name {
      font-size: 16px;
      color: #FFFFFF;
      text-align: center;
      line-height: 40px;
    }
    .display-icon {
      opacity: 0.4;
      color: white;
      font-size: 80px;
    }
    .display-name {
      opacity: 0.4;
      font-size: 24px;
      color: #FFFFFF;
      text-align: center;
      line-height: 24px;
    }
  }
</style>
