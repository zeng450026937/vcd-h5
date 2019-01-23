<template>
  <a-layout id="main-file" class="h-full">
    <a-row class="h-full">
      <a-col :span="6" class="h-full bg-grey-lighter">
        <file-nav/>
      </a-col>
      <a-col :span="18" class="h-full bg-white overflow-auto">
        <router-view/>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script>
import FileNav from '../components/main/MainNav.vue';

export default {
  name       : 'MainFile',
  components : {
    FileNav,
  },
  mounted() {
    this.$router.push('/main/file/recent');
  },
};
</script>

<style scoped>

</style>
