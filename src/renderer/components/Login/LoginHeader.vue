<template>
  <div id="login-header" class="z-10">
    <div class="px-2 h-9 select-none">
      <div class="flex flex-row h-full">
        <div class="flex items-center">
          <span class="text-xl text-white font-bold ml-2">Yealink</span>
        </div>
        <div class="flex-grow dragable my-1"></div>
        <div v-if="loginType === 'login'" class="flex items-center mr-4 text-white text-xs">
          <a-dropdown v-model="menuStatus" :trigger="['click']">
            <a-menu slot="overlay" @click="handleMenuClick">
              <a-menu-item key="cloud" class="py-2 text-xs">云服务版</a-menu-item>

              <a-menu-item key="yms" class="py-2 text-xs">企业版</a-menu-item>
            </a-menu>
            <span class="ant-dropdown-link cursor-pointer text-xs leading-tight flex items-center">
              {{ serverText }}
              <a-iconfont :type="menuStatus ? 'icon-up': 'icon-down'" class="text-base ml-2" />
            </span>
          </a-dropdown>
        </div>
        <div class="flex flex-row flex-no-grow items-center cursor-pointer text-white">

          <a-dropdown v-model="helpStatus" :trigger="['click']">
            <a-menu slot="overlay" @click.self="handleHelpClick">
              <a-menu-item key="cloud" class="px-6">帮助</a-menu-item>
              <a-menu-item key="yms" class="px-6" @click="reportIssues">反馈</a-menu-item>
            </a-menu>
            <a-iconfont type="icon-fankui"
                    class="ant-dropdown-link mr-6 text-base h-full flex items-center"/>
          </a-dropdown>

          <a-iconfont type="icon-zuixiaohua" class="mx-2 text-base hover:text-indigo no-dragable"
                  @click="clickMinimize"/>
          <a-iconfont type="icon-zuidahua" class="mx-2 text-base hover:text-indigo no-dragable"
                  @click="clickMaximize"/>
          <a-iconfont type="icon-guanbi" class="mx-2 text-base hover:text-red no-dragable"
                  @click="clickClose"/>
        </div>
      </div>
    </div>
    <login-header-modal ref="headerModal"/>
  </div>
</template>

<script>
import screenfull from 'screenfull';
import LoginHeaderModal from './LoginHeaderModal.vue';
import { LOGIN } from '../../router/constants';

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
    loginType() {
      return this.$model.login.loginType;
    },
  },
  methods : {
    clickMinimize() {
      this.$dispatch('sys.minimize');
    },
    clickMaximize() {
      // this.$dispatch('sys.maximize');
      screenfull.toggle(document.getElementById('app'));
    },
    clickClose() {
      this.$dispatch('sys.close');
    },
    handleHelpClick() {},
    handleMenuClick({ key }) {
      const ROUTE_MAP = this.loginType === 'login' ? {
        cloud : LOGIN.CLOUD_LOGIN,
        yms   : LOGIN.YMS_LOGIN,
      } : {
        cloud : LOGIN.MEETING_CONTENT,
        yms   : LOGIN.MEETING_CONTENT,
      };

      this.$router.push(ROUTE_MAP[key]);
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
    background-image: linear-gradient(-180deg, rgba(0,0,0,0.45) 4%, rgba(0,0,0,0.00) 98%);
  }
</style>
