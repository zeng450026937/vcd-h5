<template>
  <a-layout id="login-content" class="bg-transparent h-full w-full absolute">
    <router-view/>
  </a-layout>
</template>

<script>
export default {
  name : 'LoginContent',
  mounted() {
    // this.$router.push('/login/loginContent/ymsLogin');
  },
};
</script>

<style scoped>

</style>
