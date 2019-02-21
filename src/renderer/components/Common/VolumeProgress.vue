<template>
  <div id="volume-progress">
    <a-progress class="leading-none" :percent="volume" :showInfo="false" :strokeWidth="2"/>
  </div>
</template>

<script>
export default {
  name     : 'VolumeProgress',
  computed : {
    volume() {
      return this.$rtc.media.localMedia.volume;
    },
  },
};
</script>

<style lang="less">
  #volume-progress {
    .ant-progress-inner {
      background-color: rgba(153, 153, 153, 0.5);
      .ant-progress-bg {
        background-color: #4A5FC4;
      }
    }
  }
</style>
