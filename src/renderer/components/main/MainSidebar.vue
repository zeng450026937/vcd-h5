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
                  <complex-avatar
                      class="cursor-pointer"
                      :image="randomAvatar()"
                      :size="32"
                      badge
                      badge-status="online"
                      badgeSize="sm"/>
                </div>
                <div class="my-1 font-semibold">匿名</div>
                <div class="mb-1">VCS产品线-软件开发部</div>
                <div class="mb-1 text-grey cursor-pointer hover:text-grey-dark">
                  <a-icon type="edit"/>
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
            <complex-avatar
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
          <div v-if="sidebar.spacer" :key="index" class="flex flex-grow"></div>
          <div v-else :key="index"
               class="no-dragable cursor-pointer w-full flex items-center justify-center h-12"
               :class="{'mb-3':sidebar.isBottom,
                        'mt-2':sidebar.isTop,
                       'bg-indigo':currentSidebar === index,
                       'hover:text-indigo': currentSidebar !== index}"
               @click="clickMenu(sidebar, index)">
            <a-icon :type="sidebar.icon" class="text-sm"/>
          </div>
        </template>
      </div>
    </div>
  </a-layout-sider>
</template>

<script>
import ComplexAvatar from '../shared/ComplexAvatar.vue';

export default {
  name       : 'MainSidebar',
  components : {
    ComplexAvatar,
  },
  data() {
    return {
      sidebarItems : [
        { icon: 'team', isTop: true, route: 'meeting' },
        { icon: 'calendar', route: 'calendar' },
        { icon: 'contacts', route: 'contact' },
        { icon: 'setting', route: 'setting' },
        // { icon: 'file-text', route: 'file' },
        { spacer: true },
        { icon: 'question-circle', isBottom: true, route: 'feedback' },
      ],
      headMenuVisible : false,
    };
  },
  computed : {
    currentSidebar() {
      const routePath = this.$route.path;

      return this.sidebarItems.findIndex((s) => routePath.indexOf(s.route) >= 0);
    },
  },
  methods : {
    randomAvatar() {
      return 'http://img2.touxiang.cn/file/20170614/03130f686db2220fc3a252eec01d2eb6.jpg';
    },
    clickMenu(sidebar, index) {
      console.warn();
      const route = `/main/${this.sidebarItems[index].route}`;

      if (!this.$router.currentRoute.path.startsWith(route)) {
        this.$router.push(route);
      }
    },
    clickLogout() {
      this.$rtc.account.signout();
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>

</style>
