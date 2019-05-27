<template>
  <div style="min-width: 64px;" class="bg-sidebar">
    <div class="flex flex-col h-full">
      <div class="text-center mt-3 no-dragable">

        <a-popover placement="leftTop"
                   :trigger="['hover', 'click']"
                   :mouseEnterDelay="1"
                   overlayClassName="main-sidebar-popover">
          <template slot="content">
            <div class="flex flex-col items-center">

              <div style="height: 76px" class="bg-card w-full rounded-t"></div>
              <div class="mt-12 text-base leading-none px-2 truncate w-full text-center"
              >
                <span class="truncate select-none" :title="userInfo.name">{{userInfo.name}}</span>
              </div>

              <div class="mt-2 px-2 truncate w-full leading-none text-xs text-black9 text-center"
                    >
                <span class="truncate select-none" :title="fullPath">{{fullPath}}</span>
              </div>

              <div class="mt-10">
                <a-button @click="clickLogout">{{$t('nav.logout')}}</a-button>
              </div>

              <div class="text-center absolute mt-10">
                <a-avatar :size="72" class="text-xl">{{userInfo.name | filterName}}</a-avatar>
              </div>
            </div>
          </template>
          <div class="cursor-pointer">
            <a-avatar :size="32" class="text-xs">{{userInfo.name | filterName}}</a-avatar>
          </div>
        </a-popover>

      </div>
      <div class="flex flex-col items-center text-white text-3xl mt-1 h-full">
        <template v-for="(item, index) in sidebar">
          <div :key="index"
               class="no-dragable cursor-pointer w-full flex flex-col items-center justify-center h-14 relative"
               :class="{'mt-2':index === 0,
                       'active':currentSidebar === item,
                       'hover:text-indigo': currentSidebar !== item}"
               @click="clickMenu(item, index)">
            <a-iconfont :type="item.icon" class="text-xl"></a-iconfont>
            <span class="text-3xs font-thin mt-2">{{$t(item.i18nKey)}}</span>
            <div :class="{'active-tag' : currentSidebar === item}"></div>
          </div>
        </template>
        <div class="flex flex-grow"></div>
        <div  @click="openFeedback" class="no-dragable cursor-pointer
              w-full flex flex-col items-center
              justify-center hover:text-indigo h-12 mb-2">
          <a-iconfont type="icon-fankui" class="text-base"></a-iconfont>
          <span class="text-3xs font-thin mt-2">{{$t('nav.feedback')}}</span>
        </div>
      </div>
    </div>
    <Feedback-Modal ref="feedbackModal"/>
  </div>
</template>

<script>
import CommonAvatar from '../Shared/CommonAvatar.vue';
import FeedbackModal from '../Login/FeedbackModal.vue';

export default {
  name       : 'MainSidebar',
  components : {
    CommonAvatar,
    FeedbackModal,
  },
  data() {
    return {
      headMenuVisible : false,
    };
  },
  sketch : [
    {
      ns    : 'state',
      props : [ 'isInMiniConference', 'isInMiniCall' ],
    },
    {
      ns    : 'main',
      props : [ 'currentSidebar' ],
    },
  ],
  computed : {
    sidebar() {
      return this.$model.main.sidebar;
    },
    userInfo() {
      return this.$model.contact.currentContact || {
        name : this.$rtc.account.username,
      };
    },
    store() {
      return this.$model.contact.phoneBookStore;
    },
    fullPath() {
      if (!this.userInfo || !this.store) return '暂无分组';

      const paths = this.store.findBranch(this.userInfo).map((node) => node.name).reverse();

      return paths.length < 1 ? '暂无分组' : paths.slice(-2).join('-');
    },
    confStatus() {
      return this.$rtc.conference.status;
    },
    callStatus() {
      return this.$model.state.callStatus;
    },
    isCallConfirmed() {
      return this.$rtc.call.status === 'confirmed';
    },
  },
  methods : {
    clickMenu(sidebar, index) {
      if (this.currentSidebar !== sidebar) {
        this.currentSidebar = sidebar;
      }
      this.isInMiniConference = this.confStatus === 'connected';
      this.isInMiniCall = this.isCallConfirmed || this.callStatus === 'connecting';
    },
    async clickLogout() {
      if (this.confStatus === 'connected') {
        // 如果当前在会议中，则先退出会议
        await this.$rtc.conference.leave();
      }
      this.$dispatch('login.logout');
    },
    openFeedback() {
      this.$refs.feedbackModal.visible = true;
    },
  },
  filters : {
    filterName(val) {
      return /^(.*)['(', '（'].*[')', '）']|（$/.test(val) ? RegExp.$1.substr(-2, 2) : val.substr(-2, 2);
    },
  },
};
</script>

<style lang="less">
  .main-sidebar-popover {
    left: 42px !important;
    .ant-popover-arrow {
      display: none;
    }
    .ant-popover-inner-content {
      padding: 0;
      width: 240px;
      height: 252px;
      box-shadow: 0 4px 12px 0 rgba(0,0,0,0.20);
    }
  }
  .active-tag{
    position: absolute;
    left: 0;
    width: 4px;
    height: 100%;
    background: #4A5FC4;
  }
  .active {
    background : #303b6f
  }
</style>
