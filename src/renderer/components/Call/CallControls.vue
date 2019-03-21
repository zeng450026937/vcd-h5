<template>
  <a-layout id="call-controls" class="mb-5 bg-transparent">
    <div class="button-content flex h-12 items-center justify-center z-10">
      <!--音频-->
      <a-button shape="circle"
                class="control-btn w-10 h-10 text-lg text-white mx-2 border-transparent"
      >
        <a-iconfont type="icon-maikefeng"/>
      </a-button>
      <!--更多-->
      <a-popover
          trigger="click"
          v-model="showMorePanel"
          overlayClassName="more-panel-popover"
      >
        <div slot="content" class="popover-content">
          <div class="h-8 w-full px-3 popover-content-item flex items-center hover:bg-list-hover">
            <a-iconfont type="icon-shipin" class="text-lg text-indigo"/>
            <span class="ml-3 text-xs">切换为视频通话</span>
          </div>
          <div class="h-8 w-full px-3 popover-content-item flex items-center hover:bg-list-hover"
               @click="openPlateModal">
            <a-iconfont type="icon-bohao" theme="filled" class="text-lg text-indigo"/>
            <span class="ml-3 text-xs">拨号盘</span>
          </div>
        </div>
        <a-button shape="circle"
                  class="control-btn w-10 h-10 text-lg text-white mx-2 border-transparent"
                  @click="showMorePanel = !showMorePanel"
        ><a-iconfont type="icon-gengduo1"/></a-button>
      </a-popover>
      <a-button shape="circle"
                class="control-btn w-10 h-10 text-lg text-white mx-2 bg-red-light border-transparent"
                @click="hangUp"
      >
        <a-iconfont type="icon-guaduan"/>
      </a-button>
    </div>
    <call-plate-modal ref="plateModal"/>
  </a-layout>
</template>

<script>
import CallPlateModal from './CallPlateModal.vue';

export default {
  name       : 'CallControls',
  components : {
    CallPlateModal,
  },
  computed : {
    callStatus() {
      return this.$model.state.callStatus;
    },
  },
  data() {
    return {
      showMorePanel : false,
    };
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
    openPlateModal() {
      this.showMorePanel = false;
      this.$refs.plateModal.visible = true;
    },
  },
};
</script>

<style lang="less">
  #call-controls {
    .control-btn {
      background: rgba(0,0,0,0.65);
      box-shadow: 0 0 8px 0 rgba(255,255,255,0.30);
    }
  }
  .more-panel-popover {
    .ant-popover-inner-content {
      padding: 4px 0;
      .popover-content {
        width: 180px;
        height: 64px;
        .popover-content-item {
          cursor: pointer;
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
