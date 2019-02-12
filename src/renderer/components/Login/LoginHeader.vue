<template>
  <div id="login-header">
    <div class="px-2 h-9 select-none">
      <div class="flex flex-row h-full">
        <div class="flex flex-row items-center text-white flex-no-grow">
          <!--<a-icon type="cloud" class="text-2xl ml-1"/>-->
          <div class="ml-4 text-xl font-bold">
            Yealink
          </div>
        </div>
        <div class="flex-grow dragable"></div>
        <div class="flex items-center mr-4 text-white">
          <a-dropdown v-model="menuStatus" :trigger="['click']">
            <a-menu slot="overlay" @click="handleMenuClick">
              <a-menu-item key="cloud" class="py-2 ">云服务版</a-menu-item>

              <a-menu-item key="yms" class="py-2">企业版</a-menu-item>
            </a-menu>
            <span class="ant-dropdown-link cursor-pointer">
              {{ serverText }}
              <a-icon :type="menuStatus ? 'caret-up': 'caret-down'" class="text-base" />
            </span>
          </a-dropdown>
        </div>
        <div class="flex flex-row flex-no-grow items-center cursor-pointer text-white">

          <a-dropdown v-model="helpStatus" :trigger="['click']">
            <a-menu slot="overlay" @click.self="handleHelpClick">
              <a-menu-item key="cloud" class="px-6">帮助</a-menu-item>
              <a-menu-item key="yms" class="px-6" @click="reportIssues">反馈</a-menu-item>
            </a-menu>
            <a-icon type="question-circle"
                    class="ant-dropdown-link mx-2 text-base h-full flex items-center"/>
          </a-dropdown>

          <a-icon type="minus" class="text-sm mx-3 hover:text-indigo no-dragable"
                  @click="clickMinimize"/>
          <a-icon type="border" class="text-sm mx-2 hover:text-indigo no-dragable"
                  @click="clickMaximize"/>
          <a-icon type="close" class="text-sm mx-3 hover:text-red no-dragable"
                  @click="clickClose"/>
        </div>
      </div>
    </div>
    <login-header-modal ref="headerModal"/>
  </div>
</template>

<script>
import LoginHeaderModal from './LoginHeaderModal.vue';

export default {
  name       : 'LoginHeader',
  components : {
    LoginHeaderModal,
  },
  data() {
    return {
      menuStatus : false,
      helpStatus : false,

    };
  },
  computed : {
    serverText() {
      const textMap = {
        cloud : '云服务版',
        yms   : '企业版',
      };

      return textMap[this.$model.login.serverType] || '请选择服务器';
    },
    inPreview() {
      return this.$route.name === 'login-preview';
    },
    loginType() {
      return this.$model.login.loginType;
    },
  },
  methods : {
    clickMinimize() {
      this.$dispatch('sys.minimize');
    },
    clickMaximize() {
      this.$dispatch('sys.maximize');
    },
    clickClose() {
      this.$dispatch('sys.close');
    },
    handleHelpClick() {},
    handleMenuClick({ key }) {
      if (!this.inPreview) {
        // 如果不是在预览页面
        const pre = this.loginType === 'login' ? '' : 'm-';
        const routeMap = {
          cloud : `/login/loginContent/${pre}cloud`,
          yms   : `/login/loginContent/${pre}yms`,
        };

        this.$router.push(routeMap[key]);
      }
      this.$model.login.serverType = key;
      this.menuStatus = false;
    },
    reportIssues() {
      this.$refs.headerModal.visible = true;
    },

  },
  watch : {
  },
};
</script>

<style scoped lang="less">
  #login-header {
    background-image: linear-gradient(-180deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.00) 98%);
  }
</style>
