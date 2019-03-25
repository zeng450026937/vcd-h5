<template>
  <!--<div id="hold-item" class="absolute">-->
    <draggable-element ref="draggableElement"
                       parentId="conference-content"
                       place="end"
                       :class="{'z-50': isTop, 'z-40': !isTop}"
                       :style="itemStyles">
      <div slot="content" class="hold-content flex items-center pl-3 pr-4"
           @mousedown="contentClicked">
        <a-avatar class='bg-white'>
          <a-iconfont type="icon-huiyishi" class="text-indigo"/>
        </a-avatar>
        <div class="flex flex-col text-white flex-grow w-1 ml-2 text-xs justify-between">
          <span class="leading-none truncate">{{info.subject}}</span>
          <span class="mt-2 leading-none truncate">保持 {{info.interval}}</span>
        </div>
        <a-iconfont type="icon-huifu" class="text-white ml-4 text-base"/>
        <a-iconfont type="icon-guaduan" class="text-white ml-4 text-base"/>
      </div>
    </draggable-element>
  <!--</div>-->
</template>

<script>
import DraggableElement from '../Common/DraggableElement/index.vue';

export default {
  name  : 'HoldItem',
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
  components : {
    DraggableElement,
  },
  computed : {
    itemStyles() {
      return {
        top : `${44 + this.index * 52}px`,
      };
    },
  },
  methods : {
    contentClicked() {
      this.$emit('contentClicked');
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
  }
</style>
