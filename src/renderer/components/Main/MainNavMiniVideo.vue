<template>
  <div id="main-nav-mini-video" class="bg-white">
    <div v-if="showMiniVideo" class="relative" style="border: 1px solid #1D212F;">
      <div class="video-controls absolute w-full">
      <div class="h-full w-full flex flex-col">

        <div class="flex flex-grow"></div>
        <div class="flex justify-center py-3 items-center">
          <div class="button-content flex h-8 items-center z-10">
            <a-button shape="circle"
                      class="text-white mx-2"
            ><a-iconfont type="icon-shexiangtou"/></a-button>
            <a-button shape="circle"
                      class="text-white mx-2"
            ><a-iconfont type="icon-maikefeng"/></a-button>

            <a-popover
                trigger="click"
                v-model="showMorePanel"
                overlayClassName="more-panel-popover"
            >
              <div slot="content" class="popover-content text-white">
                <div class="h-8 w-full px-3 popover-content-item flex items-center">
                  <a-iconfont type="icon-maikefeng" class="text-base"/>
                  <span class="ml-3 text-xs">切换为音频通话</span>
                </div>
                <div class="h-8 w-full px-3 popover-content-item flex items-center">
                  <a-iconfont type="icon-bohao" theme="filled" class="text-base"/>
                  <span class="ml-3 text-xs">拨号盘</span>
                </div>
                <div class="h-8 w-full px-3 popover-content-item flex items-center">
                  <a-iconfont type="icon-yangshengqi" class="text-base"/>
                  <a-slider :min="1" :max="100" :defaultValue="30" class="ml-3 w-full m-auto"/>
                </div>
              </div>
              <a-button shape="circle"
                        class="text-white mx-2"
                        @click="showMorePanel = !showMorePanel"
              ><a-iconfont type="icon-gengduo"/></a-button>
            </a-popover>
            <a-button shape="circle"
                      class="text-white mx-2 bg-red-light"
                      @click="leaveConference"
            ><a-iconfont type="icon-guaduan"/></a-button>
          </div>
        </div>
      </div>
      </div>
      <video-view class="nav-mini-video bg-white"
                  source="remote"
                  object-fit="cover"
                  position="relative"
                  @dblclick.native="expandVideoContent"/>
    </div>
  </div>
</template>

<script>
import VideoView from '../Common/VideoView.vue';
import { CONFERENCE } from '../../router/constants';

export default {
  name       : 'MainNavMiniVideo',
  components : {
    VideoView,
  },
  data() {
    return {
      showMorePanel : false,
    };
  },
  computed : {
    isInConferenceView : {
      get() {
        return this.$model.state.isInConferenceView;
      },
      set(val) {
        this.$model.state.isInConferenceView = val;
      },
    },
    confStatus() {
      return this.$rtc.conference.status;
    },
    showMiniVideo() {
      return !this.isInConferenceView && this.confStatus === 'connected';
    },
  },
  methods : {
    leaveConference() {
      this.$rtc.conference.leave();
    },
    expandVideoContent() {
      this.isInConferenceView = true;
      this.$router.push(CONFERENCE.CONFERENCE_MAIN);
    },
  },
};
</script>

<style lang="less">
#main-nav-mini-video {
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
  .nav-mini-video {

  }
}

.more-panel-popover {
  .ant-popover-arrow {
    z-index: -1;
    background: rgba(0,0,0,0.65);
  }
  .ant-popover-inner {
    background: rgba(0,0,0,0.65);
  }
  .ant-popover-inner-content {
    padding: 4px 0;
    .popover-content {
      width: 180px;
      height: 96px;
      .popover-content-item {
        cursor: pointer;
        &:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        .ant-slider-rail, .ant-slider-track,.ant-slider-step {
          height: 2px;
        }
        .ant-slider-handle {
          width: 12px;
          height: 12px;
        }
      }
    }
  }
}
</style>
