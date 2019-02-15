<template>
  <a-layout id="call-connected-content" class="h-full">
    <div class="flex flex-col h-full">
      <div class="call-connecting-content-header flex flex-col h-12">
        <div class="flex items-center h-full text-white self-end px-5 no-dragable">
          <a-iconfont type="icon-quanping" class="ml-5 cursor-pointer hover:text-indigo text-base"/>
          <a-iconfont type="icon-tianjialianxiren" class="ml-5 cursor-pointer hover:text-indigo text-base"/>
          <a-iconfont type="icon-liaotian" class="ml-5 cursor-pointer hover:text-indigo text-base"/>
          <a-iconfont type="icon-kongzhi" class="ml-5 cursor-pointer hover:text-indigo text-base"/>
        </div>
      </div>
      <div class="flex flex-grow flex-col items-center justify-center">
        <a-iconfont type="icon-huiyishi" class="display-icon"/>
        <span class="display-name mt-5">音频会议</span>
      </div>
      <div class="flex flex-shrink">
        <call-controls/>
      </div>
    </div>
    <!--<div class="local-video-content">-->
      <!--<conference-local-video/>-->
    <!--</div>-->
  </a-layout>
</template>

<script>
import CallControls from './CallControls.vue';
// import ConferenceLocalVideo from '../Conference/ConferenceLocalVideo.vue';

export default {
  name       : 'CallConnectedContent',
  components : {
    CallControls,
    // ConferenceLocalVideo,
  },
  computed : {
  },
};
</script>

<style lang="less">
  #call-connected-content{
    background-color: rgb(31, 36, 55);
    .call-connecting-content-header {
      background-image: linear-gradient(-180deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.00) 98%);
    }
    .display-icon {
      opacity: 0.4;
      color: white;
      font-size: 84px;
    }
    .display-name {
      opacity: 0.4;
      font-size: 24px;
      color: #FFFFFF;
      text-align: center;
      line-height: 24px;
    }

    /*.local-video-content {*/
      /*position: absolute;*/
      /*left: 100%;*/
      /*top: 100%;*/
      /*transform: translate(-100%, -100%);*/
    /*}*/
  }
</style>
