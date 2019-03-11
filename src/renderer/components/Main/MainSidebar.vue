<template>
  <a-layout-sider
      :trigger="null"
      collapsible
      class="dragable bg-sidebar"
      :value="true"
      :width="64"
  >
    <div class="flex flex-col h-full">
      <div class="text-center mt-3 no-dragable">

        <a-popover placement="leftTop"
                   trigger="click"
                   overlayClassName="main-sidebar-popover">
          <template slot="content">
            <div class="flex flex-col items-center" v-if="userInfo">
              <div style="height: 76px" class="bg-card w-full rounded-t"></div>
              <div class="mt-12 text-base leading-none">{{userInfo.name}}</div>
              <div class="mt-2 leading-none text-xs text-black9 text-center"
                    >{{userInfo.parent.fullPath | fullName}}</div>
              <div class="mt-10">
                <a-button class="w-24" @click="clickLogout">退出账号</a-button>
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
        <template v-for="(sidebar, index) in sidebarItems">
          <div :key="index"
               class="no-dragable cursor-pointer w-full flex flex-col items-center justify-center h-12"
               :class="{'mt-2':sidebar.isTop,
                       'bg-active':currentSidebar === index,
                       'hover:text-indigo': currentSidebar !== index}"
               @click="clickMenu(sidebar, index)">
            <a-iconfont :type="sidebar.icon" class="text-base"/>
            <span class="text-3xs font-thin mt-2">{{sidebar.text}}</span>
          </div>
        </template>
        <div class="flex flex-grow"/>
        <div  @click="openFeedback" class="no-dragable cursor-pointer
              w-full flex flex-col items-center
              justify-center hover:text-indigo h-12 mb-2">
          <a-iconfont type="icon-fankui" class="text-base"/>
          <span class="text-3xs font-thin mt-2">反馈</span>
        </div>
      </div>
    </div>
    <Feedback-Modal ref="feedbackModal"/>
  </a-layout-sider>
</template>

<script>
import CommonAvatar from '../Shared/CommonAvatar.vue';
import { LOGIN, MAIN, MODULE_NAME } from '../../router/constants';
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
      sidebarItems : [
        { icon: 'icon-huiyi', text: '会议', name: MODULE_NAME.MEETING, isTop: true, route: MAIN.MEETING_INSTANCE },
        { icon: 'icon-richeng', text: '日程', name: MODULE_NAME.CALENDAR, route: MAIN.CALENDAR_VIEW },
        { icon: 'icon-lianxiren', text: '联系人', name: MODULE_NAME.CONTACT, route: MAIN.CONTACT_CORPORATE },
        { icon: 'icon-shezhi', text: '设置', name: MODULE_NAME.SETTING, route: MAIN.SETTING_ACCOUNT },
      ],
      headMenuVisible : false,
    };
  },
  computed : {
    userInfo() {
      return this.$model.account.currentContact;
    },
    isInConferenceView : {
      get() {
        return this.$model.state.isInConferenceView;
      },
      set(val) {
        this.$model.state.isInConferenceView = val;
      },
    },
    isInCallView : {
      get() {
        return this.$model.state.isInCallView;
      },
      set(val) {
        this.$model.state.isInCallView = val;
      },
    },
    confStatus() {
      return this.$rtc.conference.status;
    },
    callStatus() {
      return this.$model.state.callStatus;
    },
    notInMain() {
      return (this.confStatus === 'connected' && this.isInConferenceView)
        || (this.callStatus !== 'disconnected' && this.isInCallView);
    },
    currentSidebar() {
      const owner = this.notInMain
        ? this.$model.state.sidebarStatus.preRoute.meta.owner
        : this.$route.meta.owner || MODULE_NAME.MEETING;

      return this.sidebarItems.findIndex((s) => owner === s.name);
    },
  },
  methods : {
    randomAvatar() {
      // TODO DELETE
      return avatarList[5];
      // return process.env.NODE_ENV === 'development' ? avatarList[5] : 'https://graph.baidu.com/resource/106ee00795c4bddd7e50f01550044873.jpg';
    },
    clickMenu(sidebar, index) {
      if (this.$router.currentRoute.meta.owner !== sidebar.name) {
        this.$router.push(sidebar.route);
        this.isInConferenceView = false;
        this.isInCallView = false;
      }
      if (this.confStatus === 'connected') {
        this.$model.state.isInMiniConference = true;
      }
      if (this.callStatus === 'connected' || this.callStatus === 'connecting') {
        this.$model.state.isInMiniCall = true;
      }
    },
    async clickLogout() {
      if (this.confStatus === 'connected') {
        // 如果当前在会议中，则先退出会议
        await this.$rtc.conference.leave();
      }
      this.$model.state.sidebarStatus.mainRoute = this.$router.currentRoute.path;
      this.$rtc.account.signout();
    },
    openFeedback() {
      this.$refs.feedbackModal.visible = true;
    },
    genFullPath() {
      let parent = this.userInfo.parent;

      let fullPath = [];

      while (parent.id) {
        fullPath = [ {
          id   : parent.id,
          text : parent.name,
        } ].concat(fullPath);

        parent = parent.parent;
      }
      this.userInfo.parent.fullPath = fullPath;
    },
  },
  watch : {
    $route : {
      handler(val) {
        const { sidebarStatus } = this.$model.state;

        if (this.$model.state.isNotInCallOrConference()) {
          sidebarStatus.preRoute = val;
        }
      },
      immediate : true,
    },
    userInfo : {
      handler(val) {
        if (val && val.parent) {
          const { fullPath } = this.userInfo.parent;

          if (!fullPath || fullPath.length <= 0) {
            this.genFullPath();
          }
        }
      },
      immediate : true,
    },
  },
  filters : {
    fullName(fullPath = '') {
      return fullPath.length < 1 ? '' : fullPath.slice(-2).map((b) => b.text).join('-');
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
</style>
