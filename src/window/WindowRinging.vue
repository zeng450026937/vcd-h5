<template>
  <a-layout id="window" class="h-full">
    <div class="flex flex-col justify-center items-center h-full">
      <span class="dragable text-white text-base">C用户</span>
      <span class="text-white">正在呼你</span>
      <a-avatar :size="48" class="bg-indigo mt-2">C</a-avatar>
      <div class="flex justify-center mt-4">
        <!--视频（接听）-->
        <a-button shape="circle"
                  class="control-btn w-10 h-10 text-xl text-white mx-2"
        >
          <a-iconfont type="icon-shexiangtou"/>
        </a-button>
        <!--麦克风（接听）-->
        <a-button shape="circle"
                  class="control-btn w-10 h-10 text-xl text-white mx-2"
        >
          <a-iconfont type="icon-maikefeng"/>
        </a-button>
        <!--挂断-->
        <a-button shape="circle"
                  class="control-btn w-10 h-10 text-xl text-white mx-2 bg-red-light"
                  @click="hangUp"
        >
          <a-iconfont type="icon-guaduan"/>
        </a-button>
      </div>
    </div>
  </a-layout>
</template>

<script>
export default {
  name     : 'WindowRinging',
  computed : {
    rtc() {
      return (window.opener && window.opener.rtc) || window.rtc;
    },
  },
  methods : {
    hangUp() {
      window.close();
    },
  },
};
</script>

<style lang="less">
#window {
  background-color: rgb(31, 36, 55);
  .control-btn {
    background: rgba(0,0,0,0.65);
  }
}
</style>
