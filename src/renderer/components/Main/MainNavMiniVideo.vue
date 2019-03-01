<template>
  <div id="main-nav-mini-video" class="bg-white">
    <div class="relative" style="border: 1px solid #1D212F;">
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
                        class="text-white mx-2"
                        @click="showMorePanel = !showMorePanel"
              ><a-iconfont type="icon-gengduo1"/></a-button>
            </a-popover>
            <a-button shape="circle"
                      class="text-white mx-2 bg-red-light"
                      @click="showLeaveModal"
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
    <conference-leaving-modal ref="leavingModal"/>
  </div>
</template>

<script>
import VideoView from '../Common/VideoView.vue';
import { CONFERENCE } from '../../router/constants';
import ConferenceLeavingModal from '../Conference/ConferenceLeavingModal.vue';

export default {
  name       : 'MainNavMiniVideo',
  components : {
    VideoView,
    ConferenceLeavingModal,
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
  },
  methods : {
    showLeaveModal() {
      this.$refs.leavingModal.visible = true;
    },
    expandVideoContent() {
      this.$model.state.isInMiniConference = false;
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
</style>
