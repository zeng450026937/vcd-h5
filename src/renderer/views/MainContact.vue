<template>
  <a-layout id="main-contact" class="h-full">
    <a-row class="h-full">
      <a-col :span="6" class="h-full bg-grey-lighter">
        <contact-nav/>
      </a-col>
      <a-col :span="18" class="h-full bg-white">
        <router-view/>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script>
import ContactNav from '../components/main/MainNav.vue';

export default {
  name       : 'MainContact',
  components : {
    ContactNav,
  },
  mounted() {
    this.$router.push('/main/contact/corporate');
  },
};
</script>

<style scoped>

</style>
