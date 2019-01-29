<template>
  <div id="main-nav-mini-video" class="h-full">
    <div class="h-full w-full flex flex-col">

      <div class="flex flex-grow"></div>
      <div class="flex justify-center py-3 items-center">
        <div class="button-content flex h-8 items-center z-10">
          <a-button shape="circle" icon="video-camera"
                    class="text-white mx-2"
          ></a-button>
          <a-button shape="circle" icon="phone"
                    class="text-white mx-2"
          ></a-button>
          <a-popover
              trigger="click"
              v-model="showMorePanel"
              overlayClassName="more-panel-popover"
          >
            <div slot="content" class="popover-content text-white">
              <div class="h-8 w-full px-3 popover-content-item flex items-center">
                <a-icon type="phone" theme="filled" class="text-base"/>
                <span class="ml-3 text-xs">切换为音频通话</span>
              </div>
              <div class="h-8 w-full px-3 popover-content-item flex items-center">
                <a-icon type="appstore" theme="filled" class="text-base"/>
                <span class="ml-3 text-xs">拨号版</span>
              </div>
              <div class="h-8 w-full px-3 popover-content-item flex items-center">
                <a-icon type="sound" theme="filled" class="text-base"/>
                <a-slider :min="1" :max="100" :defaultValue="30" class="ml-3 w-full m-auto"/>
              </div>
            </div>
            <a-button shape="circle" icon="ellipsis"
                      class="text-white mx-2"
                      @click="showMorePanel = !showMorePanel"
            ></a-button>
          </a-popover>
          <a-button shape="circle" icon="export"
                    class="text-white mx-2 bg-red-light"
                    @click="leaveConference"
          ></a-button>
        </div>
      </div>
    </div>
    <video-view class="w-full h-full bg-white"
                source="remote"
                object-fit="cover"
                @dblclick.native="expandVideoContent"/>
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
  methods : {
    leaveConference() {
      this.$rtc.conference.leave();
    },
    expandVideoContent() {
      this.$router.push(CONFERENCE.CONFERENCE_MAIN);
    },
  },
};
</script>

<style lang="less">
#main-nav-mini-video {
  .button-content {
    button {
      background: rgba(0,0,0,0.65);
    }
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
