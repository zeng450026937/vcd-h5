<template>
  <a-layout id="yms-login" class="col-flex justify-center items-center bg-transparent">
    <div class="flex flex-grow"></div>
    <div class="text-white text-5xl">
      Yealink
    </div>
    <div class="flex flex-grow"></div>
    <div class="text-white text-2xl mb-4">
      登录获得更佳体验
    </div>
    <div class="items-center justify-center mt-4 w-1/3">
      <div class="flex items-center">
        <a-auto-complete
            class="certain-category-search w-full"
            dropdownClassName="certain-category-search-dropdown"
            :dropdownMatchSelectWidth="false"
            v-model="loginData.account"
            size="large"
            optionLabelProp="value"
            @select="onAccountSelect"
            @search="handleSearch"
        >
          <template slot="dataSource">
            <a-select-option v-for="item in searchResult" :key="item.account" :value="item.account" class="group">
              <div class="flex items-center px-2 py-2">
                <span class="certain-search-item-count">{{item.account}}</span>
                <div class="flex flex-grow"></div>
                <a-icon type="close" class="flex text-red opacity-0 group-hover:opacity-100"
                        @click.stop="deleteAccount(item)"/>
              </div>
            </a-select-option>
          </template>
          <a-input placeholder='电话或电子邮件' size="large" >
            <a-icon slot="prefix" type="user" class="certain-category-icon" />
          </a-input>
        </a-auto-complete>
      </div>
      <div class="flex items-center mt-4">
        <a-input
            v-model="loginData.pin"
            type='password'
            placeholder='密码'
            size="large"
        >
          <a-icon slot="prefix" type='lock'/>
        </a-input>
      </div>

      <div class="flex items-center mt-4">
        <a-input
            v-model="loginData.server"
            placeholder='服务器地址'
            size="large"
        >
          <a-icon slot="prefix" type='cloud' />
        </a-input>
      </div>

      <div class="flex mt-4 justify-between">
        <a-checkbox class="text-white">
          记住密码
        </a-checkbox>
        <a-checkbox class="text-white">
          自动登录
        </a-checkbox>
      </div>

      <div class="mt-8 text-center">
        <a-button class='rounded-full border-transparent w-2/3'
                  type="primary"
                  :disabled="!loginEnabled"
                  @click="handleLogin">
          登 陆
        </a-button>
        <a-button class='rounded-full border-transparent w-2/3 mt-4'
                  @click="joinMeeting">
          加入会议
        </a-button>
      </div>
    </div>
    <div class="flex flex-grow"></div>
    <div class="flex text-white mb-2">
      <span class="cursor-pointer">忘记密码</span>
      <div class="w-px bg-white mx-2"></div>
      <span class="cursor-pointer" @click="registerAccount">注册账号</span>
      <div class="w-px bg-white mx-2"></div>
      <span class="cursor-pointer" @click="showSettingDrawer = true">登录设置</span>
    </div>
    <div>
      <a-drawer
          width=360
          placement="right"
          :closable="false"
          @close="showSettingDrawer = false"
          :visible="showSettingDrawer"
      >
        <div name="title" class="pt-12">
          <div>设置</div>
          <div>
            <a-tabs defaultActiveKey="1">
              <a-tab-pane tab="基本设置" key="1">
                <div class="flex h-full flex-col">
                  <a-input
                      v-model="loginData.proxy"
                      placeholder='地址'
                      class="h-10 mb-4"
                  >
                    <a-icon slot="prefix" type='global'/>
                  </a-input>

                  <a-input
                      v-model="loginData.proxyPort"
                      placeholder='端口'
                      class="h-10"
                  >
                    <a-icon slot="prefix" type='api'/>
                  </a-input>
                  <div class="flex flex-grow"></div>
                  <div class="flex mt-12">
                    <a-button class='h-10 w-1/2 mr-1 bg-blue text-white'
                              @click="showSettingDrawer = false">
                      取消
                    </a-button>
                    <a-button class='h-10 w-1/2 ml-1 bg-white'
                              @click="showSettingDrawer = false">
                      确定
                    </a-button>
                  </div>
                </div>
              </a-tab-pane>
              <a-tab-pane tab="关于" key="2">
                <div class="flex flex-col h-full items-center ">
                  <div class="mt-16">
                    <a-avatar class="cursor-pointer hover:shadow bg-blue"
                              shape="square"
                              icon="cloud"
                              :size="84"/>
                  </div>
                  <div class="mt-8 text-base">
                    Yealink VC Desktop
                  </div>
                  <div class="mt-2 text-grey-dark text-sm">
                    版本号： 1.0.9-alpha
                  </div>
                  <div class="mt-6 w-3/5">
                    <a-button class="w-full" type="primary">检查更新</a-button>
                  </div>
                  <div class="mt-6">
                    <a-checkbox>更新时提醒我</a-checkbox>
                  </div>
                  <div class="flex flex-grow"></div>
                  <div class="flex text-blue mt-16 items-center">
                    <span class="cursor-pointer">用户协议</span>
                    <a-divider class="mx-4" type="vertical"></a-divider>
                    <span class="cursor-pointer">隐私政策</span>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </a-drawer>
    </div>
  </a-layout>
</template>

<script>

import { cloneDeep, debounce } from 'lodash';

export default {
  name : 'YMSLogin',
  data() {
    return {
      accountList  : [],
      searchResult : [],
      loginData    : {
        account   : '0001',
        pin       : '123456',
        server    : 'academia.com',
        proxy     : '10.200.112.165',
        proxyPort : 5060,
      },
      showSettingDrawer : false,
      debounceSearch    : null,
    };
  },
  mounted() {
    this.debounceSearch = debounce((val = '') => {
      this.searchResult = this.accountList.filter((a) => a.account.indexOf(val) >= 0);
    }, 200);
    this.initAccountList();
  },
  computed : {
    loginEnabled() {
      return this.loginData.account && this.loginData.pin;
    },
  },
  methods : {
    initAccountList() {
      this.accountList = this.$storage.query('ACCOUNT_LIST').sort((a1, a2) => a1.lastLoginDate < a2.lastLoginDate) || [];
      this.searchResult = cloneDeep(this.accountList);
      this.loginData = cloneDeep(this.accountList[0]) || this.loginData;
    },
    onAccountSelect(val) {
      this.loginData = this.accountList.find((a) => a.account === val);
    },
    handleSearch(val) {
      val = val.trim();
      this.debounceSearch(val);
    },
    registerAccount() {
    },
    handleLogin() {
      this.$dispatch('login.doLogin', this.loginData).then(() => {
        this.loginData.lastLoginDate = Date.now();
        this.$storage.insertOrUpdate('ACCOUNT_LIST', this.loginData, 'account');
      });
    },
    joinMeeting() {
      this.$model.login.loginType = 'meeting';
      this.$router.push('/login/m-yms');
    },
    deleteAccount(val) {
      this.$storage.deleteItem('ACCOUNT_LIST', val.account, 'account');
      this.initAccountList();
    },
  },
  watch : {
  },
};
</script>

<style scoped lang="less">
  #yms-login {
    .slideY-fade-enter-active {
      transition: all .3s ease;
    }
    .slideY-fade-enter, .slide-fade-leave-to {
      transform: translateY(-10px);
      opacity: 0;
    }
  }
</style>
