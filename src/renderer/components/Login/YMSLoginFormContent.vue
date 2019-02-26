<template>
  <div id="yms-login-form-content"
       class="flex flex-col bg-white shadow"
       style="width: 480px;height: 538px;">
    <div class="flex items-center justify-center w-full bg-indigo" style="height: 160px;">
      <span class="text-4xl font-semibold text-white">Yealink</span>
    </div>
    <div class="flex flex-col pt-10 px-24">
      <a-form class="login-form" @submit="handleLogin" :form="form">
        <a-form-item>
          <a-auto-complete
              v-decorator="['account']"
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
              <a-iconfont slot="prefix" type="icon-dianhua" class="text-base text-black9"/>
            </a-input>
          </a-auto-complete>
        </a-form-item>
        <a-form-item>
            <a-input v-decorator="['pin']"
                     @keypress="passwordInputted" type='password' placeholder='密码'>
              <a-tooltip
                  slot="prefix"
                  :visible="isCapsLockOn"
                  trigger="focus"
                  placement="bottomLeft">
                <template slot="title">
                  <span>大写锁定已打开</span>
                </template>
                <a-iconfont type='icon-mima' class="text-base text-black9"/>
              </a-tooltip>
            </a-input>
        </a-form-item>
        <a-form-item
            class="mb-2">
          <a-input v-decorator="['server']"
                   placeholder='服务器地址'>
            <a-iconfont slot="prefix" type='icon-fuwuqi' class="text-base text-black9"/>
          </a-input>
        </a-form-item>
        <div class="flex justify-between">
          <a-checkbox class="text-xs text-black6"
                      v-model="rememberPassword">记住密码</a-checkbox>
          <a-checkbox class="text-xs text-black6"
                      v-model="autoLogin">自动登录</a-checkbox>
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
      <div class="mt-5 text-xs text-center text-black6">
        <span class="cursor-pointer leading-tight">忘记密码</span>
        <a-divider type="vertical" class="mx-5 bg-grey h-5"/>
        <span class="cursor-pointer leading-tight" @click="registerAccount">注册账号</span>
        <a-divider type="vertical" class="mx-5 bg-grey h-5"/>
        <a-badge v-if="hasNewVersion">
              <span slot="count"
                    class="text-white bg-indigo rounded-lg h-4 leading-none"
                    style="transform: translate(100%, -50%);font-size: 10px;width: 31px;">
                <span class="leading-tightest">NEW</span>
              </span>
          <span class="cursor-pointer leading-tight text-xs" @click="openSetting">设置</span>
        </a-badge>
        <span v-else class="cursor-pointer leading-tight text-xs" @click="openSetting">设置</span>
      </div>
      <div>
        <p class="text-xs text-center leading-tight mt-5 text-black9">
          点击登录则代表您同意
          <span class="text-indigo-light cursor-pointer">《用户协议》</span>
          和
          <span class="text-indigo-light cursor-pointer">《隐私政策》</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { cloneDeep, debounce } from 'lodash';
import { LOGIN } from '../../router/constants';
import { LOGIN_STORAGE } from '../../storage';
import { isCapsLockOn } from '../../utils';

export default {
  name : 'YMSLoginFormContent',
  data() {
    return {
      form         : this.$form.createForm(this),
      searchResult : [],
      isCapsLockOn : false,
    };
  },
  mounted() {
    this.debounceSearch = debounce((val = '') => {
      this.searchResult = this.accountList.filter((a) => a.account.indexOf(val) >= 0);
    }, 200);
    this.initAccountList();
    this.$nextTick(() => {
      if (this.autoLogin && !this.autoLoginDisabled) {
        this.handleLogin();
        this.autoLoginDisabled = true;
      }
    });
  },
  computed : {
    hasNewVersion() {
      // TODO check the status of update
      return false;
    },
    rememberPassword : {
      get() {
        return this.$model.login.rememberPassword;
      },
      set(val) {
        this.$model.login.rememberPassword = val;
      },
    },
    autoLogin : {
      get() {
        return this.$model.login.autoLogin;
      },
      set(val) {
        this.$model.login.autoLogin = val;
      },
    },
    autoLoginDisabled : {
      get() {
        return this.$model.login.autoLoginDisabled;
      },
      set(val) {
        this.$model.login.autoLoginDisabled = val;
      },
    },
  },
  methods : {

    handleLogin(e) {
      if (e) e.preventDefault();
      this.form.validateFields([ 'account', 'pin', 'server' ],
        { force: true },
        (err, values) => {
          if (!err) {
            this.$dispatch('login.doLogin', values);
          }
        });
    },
    registerAccount() {
    },
    joinMeeting() {
      this.$router.push(LOGIN.YMS_MEETING);
    },
    deleteAccount(val) {
      this.$storage.deleteItem(LOGIN_STORAGE.ACCOUNT_LIST, val.account, 'account');
      this.initAccountList();
    },
    openSetting() {
      this.$emit('openSetting');
    },
    initAccountList() {
      this.accountList = this.$storage.query(LOGIN_STORAGE.ACCOUNT_LIST) || [];
      this.accountList.sort((a1, a2) => a2.lastLoginDate - a1.lastLoginDate);

      this.searchResult = cloneDeep(this.accountList.slice(0, 10));
      this.updateForm(cloneDeep(this.accountList[0]));
    },
    updateForm(data) {
      if (!data) return;
      this.form.setFieldsValue({
        account : data.account,
        pin     : data.pin,
        server  : data.server,
      });
      this.$model.login.proxy = data.proxy;
      this.$model.login.proxyPort = data.proxyPort;
    },
    onAccountSelect(val) {
      this.updateForm(this.accountList.find((a) => a.account === val));
    },
    handleSearch(val) {
      this.debounceSearch(val.trim());
    },
    passwordInputted(event) {
      this.isCapsLockOn = isCapsLockOn(event);
    },
  },
};
</script>

<style scoped>

</style>
