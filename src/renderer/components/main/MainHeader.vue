<template>
  <a-layout id="main-header" class="flex-no-grow">
    <a-layout-header class="px-8 h-12">
      <div class="flex flex-row h-full">
        <div class="flex flex-row text-white items-center flex-no-grow">
          <complex-avatar :image="randomAvatar()"
                          size="large"
                          badgeIcon="phone"
                          badge
                          badge-status="online"/>
        </div>
        <div class="flex-grow dragable"></div>
        <div class="flex flex-row flex-no-grow text-white items-center cursor-pointer">
          <a-icon type="minus" class="text-lg mx-2"/>
          <a-icon type="border" class="text-lg mx-6"/>
          <a-icon type="close" class="text-lg mx-2 hover:text-red"/>
        </div>
      </div>
    </a-layout-header>
  </a-layout>
</template>

<script>
import ComplexAvatar from '../shared/ComplexAvatar.vue';

export default {
  name       : 'MainHeader',
  components : {
    ComplexAvatar,
  },
  data() {
    return {
      menuStatus : false,
    };
  },
  computed : {

  },
  methods : {
    randomAvatar() {
      return 'http://img2.touxiang.cn/file/20170614/03130f686db2220fc3a252eec01d2eb6.jpg';
    },
  },
  watch : {
  },
};
</script>

<style scoped lang="less">
  #login-header {
    background: rgba(0, 0, 0, 0.4);
  }
</style>
