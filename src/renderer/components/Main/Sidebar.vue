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
                <a-button class="w-16" @click="clickLogout">注销</a-button>
              </div>

              <div class="text-center absolute mt-10">
                <a-avatar :size="72" :src="randomAvatar()"></a-avatar>
              </div>
            </div>
          </template>
          <div class="cursor-pointer">
            <a-avatar :size="32" :src="randomAvatar()"></a-avatar>
          </div>
        </a-popover>

      </div>
      <div class="flex flex-col items-center text-white text-3xl mt-1 h-full">
        <template v-for="(item, index) in sidebar">
          <div :key="index"
               class="no-dragable cursor-pointer w-full flex flex-col items-center justify-center h-12 relative"
               :class="{'mt-2':index === 0,
                       'active':currentSidebar === item,
                       'hover:text-indigo': currentSidebar !== item}"
               @click="clickMenu(item, index)">
            <a-iconfont :type="item.icon" class="text-base"></a-iconfont>
            <span class="text-3xs font-thin mt-2">{{item.text}}</span>
            <div :class="{'active-tag' : currentSidebar === item}"></div>
          </div>
        </template>
        <div class="flex flex-grow"></div>
        <div  @click="openFeedback" class="no-dragable cursor-pointer
              w-full flex flex-col items-center
              justify-center hover:text-indigo h-12 mb-2">
          <a-iconfont type="icon-fankui" class="text-base"></a-iconfont>
          <span class="text-3xs font-thin mt-2">反馈</span>
        </div>
      </div>
    </div>
    <Feedback-Modal ref="feedbackModal"/>
  </div>
</template>

<script>
import CommonAvatar from '../Shared/CommonAvatar.vue';
import FeedbackModal from '../Login/FeedbackModal.vue';

const avatarList = [
  'http://img2.touxiang.cn/file/20170614/03130f686db2220fc3a252eec01d2eb6.jpg',
  'http://img2.touxiang.cn/file/20170614/67058cc84dcd9c68ec2367073a7b098a.jpg',
  'http://img2.touxiang.cn/file/20170614/7e5717b1ca44b3c22794ceb55ff9dfa0.jpg',
  'http://img2.touxiang.cn/file/20170614/cd3c756eaf54e20172c7d36f5c029320.jpg',
  'http://img2.touxiang.cn/file/20170614/ce471bee343843b4b6a1b9e0b7615957.jpg',
  'http://img2.touxiang.cn/file/20170616/9b732f6fecbbbad8006f8c8c7b8be392.jpg',
  'http://img2.touxiang.cn/file/20170616/33c46a5d4ed3c2ee7b7fb6a9256ba8f2.jpg',
  'http://img2.touxiang.cn/file/20170616/a86490ed047755f9280213c8554f65af.jpg',
  'http://img2.touxiang.cn/file/20170616/0b01a74167c13eed138d698aba43fe20.jpg',
];

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
    randomAvatar() {
      return avatarList[5];
    },
    clickMenu(sidebar, index) {
      if (this.currentSidebar !== sidebar) {
        this.currentSidebar = sidebar;
      }
      this.isInMiniConference = this.confStatus === 'connected';
      this.isInMiniCall = this.isCallConfirmed || this.callStatus === 'connecting';

      this.$router.push(sidebar.currentPath);
    },
    async clickLogout() {
      if (this.confStatus === 'connected') {
        // 如果当前在会议中，则先退出会议
        await this.$rtc.conference.leave();
      }
      this.$rtc.account.signout();
    },
    openFeedback() {
      this.$refs.feedbackModal.visible = true;
    },
  },
  watch : {
    currentSidebar(sidebar) {
      if (sidebar.currentRoute) {
        this.$router.push(sidebar.currentRoute);
      }
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
