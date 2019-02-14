<template>
  <a-layout id="cloud-login" class="col-flex justify-center items-center bg-transparent">
    <div class="flex flex-grow"></div>
    <div class="top text-center">
      <div class="header">
        <span class="text-4xl font-semibold">Yealink VCD</span>
      </div>
      <div class="mt-4 text-grey-darker">登录获得更佳体验</div>
    </div>
    <div style="width: 368px;" class="mt-6">
      <a-form @submit="handleLogin" :autoFormCreate="(form)=>{this.form = form}">
        <a-form-item
            fieldDecoratorId="account">
          <a-auto-complete
              class="certain-category-search w-full"
              :dropdownMatchSelectWidth="false"
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
                  <a-iconfont type="close" class="flex text-red opacity-0 group-hover:opacity-100"
                          @click.stop="deleteAccount(item)"/>
                </div>
              </a-select-option>
            </template>
            <a-input placeholder='电话或电子邮件' size="large" >
              <a-iconfont slot="prefix" type="user"/>
            </a-input>
          </a-auto-complete>
        </a-form-item>
        <a-form-item
            fieldDecoratorId="pin">
          <a-input type='password' placeholder='密码' size="large">
            <a-iconfont slot="prefix" type='lock'/>
          </a-input>
        </a-form-item>
        <a-form-item
            fieldDecoratorId="server">
          <a-input placeholder='服务器地址' size="large">
            <a-iconfont slot="prefix" type='cloud' />
          </a-input>
        </a-form-item>
        <div class="flex justify-between">
          <a-checkbox>记住密码</a-checkbox>
          <a-checkbox>自动登录</a-checkbox>
        </div>
        <a-form-item class="mt-6 mb-4">
          <a-button size="large" type="primary" htmlType="submit" block>登录</a-button>
        </a-form-item>
        <a-form-item>
          <a-button size="large" @click="joinMeeting" block>加入会议</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="flex flex-grow"></div>
    <div class="flex mb-2">
      <span class="cursor-pointer">忘记密码</span>
      <span class="cursor-pointer mx-3" @click="registerAccount">注册账号</span>
      <span class="cursor-pointer" @click="openSetting">登录设置</span>
    </div>
    <yms-login-content-drawer ref="loginDrawer"/>
  </a-layout>
</template>

<script>

import { cloneDeep, debounce } from 'lodash';
import YmsLoginContentDrawer from './YMSLoginContentDrawer.vue';

export default {
  name       : 'YMSLogin',
  components : {
    YmsLoginContentDrawer,
  },
  data() {
    return {
      accountList    : [],
      searchResult   : [],
      debounceSearch : null,
    };
  },
  mounted() {
    this.debounceSearch = debounce((val = '') => {
      this.searchResult = this.accountList.filter((a) => a.account.indexOf(val) >= 0);
    }, 200);
    this.initAccountList();
  },
  methods : {
    initAccountList() {
      this.accountList = this.$storage.query('ACCOUNT_LIST').sort((a1, a2) => a1.lastLoginDate < a2.lastLoginDate) || [];
      this.searchResult = cloneDeep(this.accountList);
      this.updateForm(cloneDeep(this.accountList[0]));
    },
    updateForm(data) {
      if (!data) return;
      this.form.setFieldsValue({
        account : data.account,
        pin     : data.pin,
        server  : data.server,
      });
    },
    onAccountSelect(val) {
      this.updateForm(this.accountList.find((a) => a.account === val));
    },
    handleSearch(val) {
      this.debounceSearch(val.trim());
    },
    handleLogin(e) {
      e.preventDefault();
      this.form.validateFields([ 'account', 'pin', 'server' ],
        { force: true },
        (err, values) => {
          if (!err) {
            const loginData = Object.assign({}, values, {
              proxy     : '10.200.112.165',
              proxyPort : 5060,
            });

            this.$dispatch('login.doLogin', loginData).then(() => {
              loginData.lastLoginDate = Date.now();
              this.$storage.insertOrUpdate('ACCOUNT_LIST', loginData, 'account');
            });
            this.$storage.insertOrUpdate('ACCOUNT_LIST', loginData, 'account');
          }
        });
    },
    registerAccount() {
    },
    joinMeeting() {
    },
    deleteAccount(val) {
      this.$storage.deleteItem('ACCOUNT_LIST', val.account, 'account');
      this.initAccountList();
    },
    openSetting() {
      this.$refs.loginDrawer.visible = true;
    },
  },
};
</script>

<style scoped lang="less">
  #yms-login {
  }
</style>
