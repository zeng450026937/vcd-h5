<template>
  <div id="conference-local-video" class="relative">
    <remote-video source="local" object-fit="fill"/>
  </div>
</template>

<script>
import RemoteVideo from '../Common/VideoView.vue';

export default {
  name       : 'ConferenceLocalVideo',
  components : {
    RemoteVideo,
  },
};
</script>

<style scoped lang="less">
  #conference-local-video {
    width: 280px;
    height: 158px;
  }
</style>
