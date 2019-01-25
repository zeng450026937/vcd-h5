<template>
  <a-layout-footer id="app-footer">
    <a-row>
      <span class="white--text">{{bottomText}}</span>
    </a-row>
  </a-layout-footer>
</template>

<script>
export default {
  name     : 'AppFooter',
  computed : {
    bottomText() {
      return `Apollo VC powered by Yealink ${this.$model.sys.version}`;
    },
  },
};
</script>

<style scoped>

</style>
