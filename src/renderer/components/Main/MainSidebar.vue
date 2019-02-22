<template>
  <a-layout-sider
      :trigger="null"
      collapsible
      class="dragable bg-indigo-darker"
      :value="true"
      :width="64"
  >
    <div class="flex flex-col h-full">
      <div class="text-center mt-3 no-dragable">

        <a-popover placement="leftTop" trigger="click">
          <template slot="content">
            <div class="flex flex-col w-48">
              <div class="flex flex-col items-center">
                <div class="text-center">
                  <common-avatar
                      class="cursor-pointer"
                      :image="randomAvatar()"
                      :size="32"
                      badge
                      badge-status="online"
                      badgeSize="sm"/>
                </div>
                <div class="my-1 font-semibold">{{userInfo.userName}}</div>
                <div class="mb-1">VCS产品线-软件开发部</div>
                <div class="mb-1 text-grey cursor-pointer hover:text-grey-dark">
                  <a-iconfont type="edit"/>
                  编辑个性签名
                </div>
              </div>
              <a-divider class="my-1"/>
              <div class="flex flex-col my-1">
                <div class="flex items-center cursor-pointer">
                  <div class="w-3 h-3 rounded-full bg-green"></div>
                  <span class="ml-2">我在线上</span>
                </div>
                <div class="flex items-center my-1 cursor-pointer">
                  <div class="w-3 h-3 rounded-full bg-red"></div>
                  <span class="ml-2">请勿打扰</span>
                </div>
                <a-divider class="my-1"/>
                <div class="my-1 cursor-pointer text-center hover:text-red" @click="clickLogout">
                  退出账号
                </div>
                <a-divider class="my-1"/>
              </div>
            </div>
          </template>
          <div>
            <common-avatar
                class="cursor-pointer"
                :image="randomAvatar()"
                :size="32"
                badge
                badgeSize="sm"
                badge-status="online"/>
          </div>
        </a-popover>

      </div>
      <div class="flex flex-col items-center text-white text-3xl mt-1 h-full">
        <template v-for="(sidebar, index) in sidebarItems">
          <div :key="index"
               class="no-dragable cursor-pointer w-full flex flex-col items-center justify-center h-12"
               :class="{'mt-2':sidebar.isTop,
                       'bg-indigo':currentSidebar === index,
                       'hover:text-indigo': currentSidebar !== index}"
               @click="clickMenu(sidebar, index)">
            <a-iconfont :type="sidebar.icon" class="text-base"/>
            <span class="text-3xs font-thin mt-2">{{sidebar.text}}</span>
          </div>
        </template>
        <div class="flex flex-grow"/>
        <div class="no-dragable cursor-pointer
              w-full flex flex-col items-center
              justify-center hover:text-indigo h-12 mb-2">
          <a-iconfont type="icon-fankui" class="text-base"/>
          <span class="text-3xs font-thin mt-2">反馈</span>
        </div>
      </div>
    </div>
  </a-layout-sider>
</template>

<script>
import CommonAvatar from '../Shared/CommonAvatar.vue';
import { LOGIN, MAIN, MODULE_NAME } from '../../router/constants';

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
  },
  data() {
    return {
      sidebarItems : [
        { icon: 'icon-huiyi', text: '会议', name: MODULE_NAME.MEETING, isTop: true, route: MAIN.MEETING_INSTANCE },
        { icon: 'icon-richeng', text: '日程', name: MODULE_NAME.CALENDAR, route: MAIN.CALENDAR_VIEW },
        { icon: 'icon-lianxiren', text: '联系人', name: MODULE_NAME.CONTACT, route: MAIN.CONTACT_CORPORATE },
        { icon: 'icon-shezhi', text: '设置', name: MODULE_NAME.SETTING, route: MAIN.SETTING_ACCOUNT },
        // { spacer: true },
        // { icon: 'icon-fankui', text: '反馈', isBottom: true, route: MAIN.FEEDBACK },
      ],
      headMenuVisible : false,
    };
  },
  computed : {
    userInfo() {
      return {
        userName : this.$rtc.account.username,
      };
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
      return process.env.NODE_ENV === 'development' ? avatarList[5] : 'https://graph.baidu.com/resource/106ee00795c4bddd7e50f01550044873.jpg';
    },
    clickMenu(sidebar, index) {
      if (this.$router.currentRoute.meta.owner !== sidebar.name) {
        this.$router.push(sidebar.route);
        this.isInConferenceView = false;
      }
      if (this.confStatus === 'connected') {
        this.$model.state.sidebarStatus.preRoute = this.$router.currentRoute;
      }
    },
    clickLogout() {
      this.$rtc.account.signout();
      this.$router.push(LOGIN.LOGIN_CONTENT);
      clearTimeout(window.clientHeart);
    },
  },
};
</script>

<style scoped>

</style>
