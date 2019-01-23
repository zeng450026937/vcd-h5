<template>
  <a-layout id="app" class="h-full">
    <router-view name="header"/>
    <router-view name="sidebar"/>
    <router-view/>
  </a-layout>
</template>

<script>
export default {
  name       : 'App',
  components : {
  },
  data() {
    return {};
  },
  computed : {
  },
  methods : {},
};
</script>

<style lang="less">
  #app {
    background-image: url('./assets/bg.jpg');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-attachment: fixed;
  }
</style>
