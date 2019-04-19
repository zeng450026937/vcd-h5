<template>
  <div class="z-10 login-header" :style="{background}">
    <div class="h-9 select-none">
      <div class="flex flex-row h-full">

        <div class="flex items-center ml-2" v-if="useTitle">
          <img class="ml-2" src="../../assets/login-header-logo.png">
          <span class="text-white ml-2">Yealink VC Desktop</span>
        </div>

        <div class="flex-grow dragable my-1"></div>

        <div v-if="useOperationBar" class="flex items-center mr-4 text-xs" :class="color">
          <a-dropdown v-if="useDropDown" v-model="menuStatus" :trigger="['click']">
            <a-menu slot="overlay" @click="handleMenuClick">
              <a-menu-item key="cloud" class="py-2 text-xs">云服务版</a-menu-item>

              <a-menu-item key="yms" class="py-2 text-xs">企业版</a-menu-item>
            </a-menu>
            <span class="ant-dropdown-link cursor-pointer text-xs leading-tight flex items-center">
              {{ serverText }}
              <a-iconfont :type="menuStatus ? 'icon-up': 'icon-down'" class="text-base ml-2"></a-iconfont>
            </span>
          </a-dropdown>
        </div>
        <div v-if="useOperationBar" class="flex flex-row flex-no-grow items-center cursor-pointer" :class="color">

          <a-dropdown v-if="useDropDown" v-model="helpStatus" :trigger="['click']">
            <a-menu slot="overlay" @click.self="handleHelpClick">
              <a-menu-item key="cloud" class="px-6" @click="goHelp">帮助</a-menu-item>
              <a-menu-item key="yms" class="px-6" @click="reportIssues">反馈</a-menu-item>
            </a-menu>
            <a-iconfont type="icon-fankui"
                        title="反馈"
                    class="ant-dropdown-link mr-8 text-base h-full flex items-center"></a-iconfont>
          </a-dropdown>

          <common-header/>
        </div>
      </div>
    </div>
    <feedback-modal v-if="useOperationBar" ref="headerModal"/>
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
  props : {
    useOperationBar : {
      type    : Boolean,
      default : true,
    },
    useTitle : {
      type    : Boolean,
      default : true,
    },
    useDropDown : {
      type    : Boolean,
      default : true,
    },
    background : {
      type    : String,
      default : '#ffffff00',
    },
    color : {
      type    : String,
      default : 'gray',
    },
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
      this.$dispatch('application.minimize');
    },
    clickMaximize() {
      this.$dispatch('application.maximize');
    },
    clickClose() {
      this.$dispatch('application.close');
    },
    handleHelpClick() {},
    handleMenuClick({ key }) {
      this.serverType = key;
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
    goHelp() {
      this.helpStatus = false;
      this.$dispatch('application.openExternal', { path: 'http://support.yealink.com' });
    },
  },
  watch : {
    serverType : {
      handler   : 'updateRoute',
      immediate : true,
    },
    loginType : {
      handler   : 'updateRoute',
      immediate : true,
    },
  },
};
</script>

<style scoped lang="less">
  .login-header {
    .gray {
      color: #333333;
    }
    .white {
      color : #ffffff;
    }
  }
</style>
