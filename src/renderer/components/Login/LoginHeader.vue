<template>
  <div id="login-header" class="z-10">
    <div class="px-2 h-9 select-none">
      <div class="flex flex-row h-full">
        <div class="flex items-center">
          <img class="ml-2" src="../../assets/login-header-logo.png">
          <span class="text-white ml-2">Yealink VC Desktop</span>
        </div>
        <div class="flex-grow dragable my-1"></div>
        <div class="flex items-center mr-4 text-white text-xs">
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
                        title="反馈"
                    class="ant-dropdown-link mr-8 text-base h-full flex items-center"/>
          </a-dropdown>

          <common-header class="mr-2"/>
        </div>
      </div>
    </div>
    <feedback-modal ref="headerModal"/>
  </div>
</template>

<script>
import CommonHeader from '../Shared/CommonHeader.vue';
import FeedbackModal from './FeedbackModal.vue';
import { LOGIN } from '../../router/constants';

export default {
  name       : 'LoginHeader',
  components : {
    FeedbackModal,
    CommonHeader,
  },
  data() {
    return {
      menuStatus : false,
      helpStatus : false,
    };
  },
  sketch : {
    ns    : 'account',
    props : [ 'serverType', 'loginType' ],
  },
  computed : {
    serverText() {
      return this.serverType === 'cloud' ? '云服务版' : '企业版';
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
      this.$model.login.serverType = key;
      this.menuStatus = false;
    },
    reportIssues() {
      this.$refs.headerModal.visible = true;
      this.helpStatus = false;
    },
    updateRoute() {
      const ROUTE = this.loginType === 'login' ? LOGIN.LOGIN_CONTENT : LOGIN.MEETING_CONTENT;

      this.$router.push(ROUTE);
    },
  },
  watch : {
    serverType : {
      handler   : 'updateRoute',
      immediate : true,
    },
    loginType() {
      this.updateRoute();
    },
  },
};
</script>

<style scoped lang="less">
  #login-header {
    background-image: linear-gradient(-180deg, rgba(0,0,0,0.45) 4%, rgba(0,0,0,0.00) 98%);
  }
</style>
