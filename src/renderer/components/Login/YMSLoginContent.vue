<template>
  <a-layout id="yms-login" class="h-full bg-transparent">
    <div class="flex flex-col items-center justify-center h-full">
      <div class="flex flex-col bg-white shadow" style="width: 480px;height: 538px;">
        <div class="flex items-center justify-center w-full bg-indigo" style="height: 160px;">
          <span class="text-4xl font-semibold text-white">Yealink</span>
        </div>
        <div class="flex flex-col pt-10 px-24">
          <a-form @submit="handleLogin" :autoFormCreate="(form)=>{this.form = form}">
            <a-form-item
                fieldDecoratorId="account">
              <a-auto-complete
                  class="certain-category-search w-full"
                  :dropdownMatchSelectWidth="false"
                  optionLabelProp="value"
                  @select="onAccountSelect"
                  @search="handleSearch"
              >
                <template slot="dataSource">
                  <a-select-option v-for="item in searchResult" :key="item.account" :value="item.account" class="group">
                    <div class="flex items-center px-2 py-2">
                      <span class="certain-search-item-count">{{item.account}}</span>
                      <div class="flex flex-grow"></div>
                      <a-iconfont
                          type="icon-guanbi"
                          class="flex text-red opacity-0 group-hover:opacity-100"
                          @click.stop="deleteAccount(item)"
                      ></a-iconfont>
                    </div>
                  </a-select-option>
                </template>
                <a-input placeholder='电话或电子邮件'>
                  <a-iconfont slot="prefix" type="icon-dianhua"/>
                  <!--<a-iconfont slot="prefix" type="user"/>-->
                </a-input>
              </a-auto-complete>
            </a-form-item>
            <a-form-item
                fieldDecoratorId="pin">
              <a-input type='password' placeholder='密码'>
                <a-iconfont slot="prefix" type='icon-mima'/>
              </a-input>
            </a-form-item>
            <a-form-item
                fieldDecoratorId="server"
                class="mb-2">
              <a-input placeholder='服务器地址'>
                <a-iconfont slot="prefix" type='icon-fuwuqi' />
              </a-input>
            </a-form-item>
            <div class="flex justify-between">
              <a-checkbox>记住密码</a-checkbox>
              <a-checkbox>自动登录</a-checkbox>
            </div>
            <a-form-item class="mt-9 mb-0">
              <div class="flex">
                <div class="w-1/2 mr-2">
                  <a-button @click="joinMeeting" block>加入会议</a-button>
                </div>
                <div class="w-1/2 ml-2">
                  <a-button type="primary" htmlType="submit" block>登录</a-button>
                </div>
              </div>
            </a-form-item>
          </a-form>
          <div class="mt-5 text-xs text-center text-black-lightest">
            <span class="cursor-pointer leading-tight">忘记密码</span>
            <a-divider type="vertical" class="mx-5 bg-grey h-5"/>
            <span class="cursor-pointer leading-tight" @click="registerAccount">注册账号</span>
            <a-divider type="vertical" class="mx-5 bg-grey h-5"/>
            <span class="cursor-pointer leading-tight" @click="openSetting">设置</span>
          </div>
          <div>
            <p class="text-xs text-center leading-tight mt-5 text-black-lightest">
              点击登录则代表您同意<span class="text-indigo">《用户协议》</span>和<span class="text-indigo">《隐私政策》</span>
            </p>
          </div>
        </div>
      </div>
      <div class="flex mt-4 items-center">
        <p class="text-xs text-white leading-tight">Copyright © 2018 Yealink Inc. All rights reserved.</p>
      </div>
    </div>
    <yms-login-content-drawer ref="loginDrawer"/>
  </a-layout>
</template>

<script>

import { cloneDeep, debounce } from 'lodash';
import YmsLoginContentDrawer from './YMSLoginContentDrawer.vue';
import { LOGIN } from '../../router/constants';

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
      this.$refs.loginDrawer.proxy = data.proxy;
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
            console.warn(this.$refs.loginDrawer);
            const loginData = Object.assign({}, values, {
              proxy     : this.$refs.loginDrawer.proxy,
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
      this.$router.push(LOGIN.YMS_MEETING);
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

<style lang="less">
  #yms-login {
    .ant-form-item{
      margin-bottom: 12px;
    }
  }
</style>
