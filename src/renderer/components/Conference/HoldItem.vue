<template>
  <!--<div id="hold-item" class="absolute">-->
    <draggable-element ref="draggableElement"
                       :parentId="parentId"
                       place="end"
                       :class="{'z-50': isTop, 'z-40': !isTop}"
                       :style="itemStyles">
      <div slot="content" class="hold-content flex items-center pl-3 pr-4"
           @mousedown="contentClicked">
        <a-avatar class='bg-white'>
          <a-iconfont type="icon-huiyishi" class="text-indigo"/>
        </a-avatar>
        <div class="flex flex-col text-white flex-grow w-1 ml-2 text-xs justify-between">
          <span class="leading-none truncate">{{info.displayName}}</span>
          <span class="mt-2 leading-none truncate">保持 {{interval}}</span>
        </div>
        <a-iconfont type="icon-huifu"
                    title="恢复通话"
                    class="hold-item-btn" @click="unhold"/>
        <a-iconfont type="icon-guaduan"
                    title="挂断通话"
                    class="hold-item-btn" @click="decline"/>
      </div>
    </draggable-element>
  <!--</div>-->
</template>

<script>
import DraggableElement from '../Common/DraggableElement/index.vue';
import { secondsToHms } from '../../utils/index';

export default {
  name : 'HoldItem',

  components : {
    DraggableElement,
  },
  props : {
    isTop : {
      type    : Boolean,
      default : false,
    },
    info : {
      type : Object,
      default() {
        return {};
      },
    },
    index : { // hold 住的悬浮框的位置
      type    : Number,
      default : 0,
    },
  },
  data() {
    return {
      interval : '00:00:00',
    };
  },
  mounted() {
    setInterval(() => {
      this.interval = secondsToHms((Date.now() - this.info.date)/1000);
    }, 1000);
  },
  destroyed() {
    clearInterval(this.timer);
  },
  computed : {
    itemStyles() {
      return {
        top : `${44 + this.index * 52}px`,
      };
    },
    parentId() {
      return this.$rtc.conference.connected ? 'conference-content' : 'call-content';
    },
  },
  methods : {
    contentClicked() {
      this.$emit('contentClicked');
    },
    unhold() {
      this.info.channel.unhold();
    },
    decline() {
      this.info.channel.disconnect();
    },
  },
};
</script>

<style scoped lang="less">
  .hold-content{
    width: 228px;
    height: 48px;
    background: rgba(0,0,0,0.65);
    box-shadow: 0 0 8px 0 rgba(255,255,255,0.30);
    .hold-item-btn {
      @apply text-white ml-4 text-base cursor-pointer;
    }
  }
</style>
