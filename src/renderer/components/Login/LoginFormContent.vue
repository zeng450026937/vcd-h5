<template>
  <div id="login-form-content" class="flex flex-col bg-white shadow w-full h-full relative">

    <div class="flex flex-col content">
      <div class="login-title">
        <span>{{$t('login.login')}}</span>
      </div>

      <div class="login-form flex flex-col" @keyup.enter="handleLogin">
        <div class="mb-4">
          <a-auto-complete
              v-model="loginData.account"
              class="certain-category-search w-full overflow-x-hidden"
              :dropdownMatchSelectWidth="false"
              optionLabelProp="value"
              @select="selectAccount"
              @search="searchAccount"
          >
            <template v-if="searchedAccounts.length > 0" slot="dataSource">
              <a-select-opt-group>
                <div class="select-opt-label flex justify-between px-3 border-b" slot="label">
                  <span>历史记录</span>
                  <span class="text-red cursor-pointer" @click="clearAccount">清空</span>
                </div>
                <a-select-option v-for="item in searchedAccounts"
                                 :key="item.account" :value="item.account" class="group">
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
              </a-select-opt-group>
            </template>
            <a-input maxlength="64" placeholder='电话或电子邮件'>
              <a-iconfont slot="prefix" type="icon-dianhua" class="text-base text-black9"/>
            </a-input>
          </a-auto-complete>
        </div>

        <div class="mb-4">
          <a-input
              v-model="loginData.pin"
              maxlength="64"
              @keypress="passwordInputted"
              type="password"
              placeholder='密码'>
            <div slot="prefix">
              <a-tooltip
                  :visible="isCapsLockOn"
                  trigger="focus"
                  placement="bottomLeft">
                <template slot="title">
                  <span>大写锁定已打开</span>
                </template>
                <a-iconfont type='icon-mima' class="text-base text-black9"/>
              </a-tooltip>
            </div>
          </a-input>
        </div>
        <div class="flex justify-between mt-24px">
          <a-checkbox class="text-xs text-black6"
                      :checked="rmbPassword"
                      @change="rmbPassword = !rmbPassword"
          >记住密码
          </a-checkbox>
          <a-checkbox class="text-xs text-black6"
                      :checked="autoLogin"
                      @change="autoLogin = !autoLogin"
          >自动登录
          </a-checkbox>
        </div>

        <div class="mt-9">
          <div class="flex">
            <div class="w-1/2 mr-2">
              <a-button type="primary" block @click="handleLogin">登录</a-button>
            </div>
            <div class="w-1/2 ml-2">
              <a-button @click="toMeeting" block>加入会议</a-button>
            </div>
          </div>
        </div>

      </div>

      <div class="text-xs text-center text-black6 mt-48px h-28px">
        <template v-if="serverType === 'cloud'">
          <span class="cursor-pointer leading-tight"
                @click="toForget">忘记密码</span>
          <a-divider type="vertical" class="mx-5 bg-divider h-28px"/>
          <span class="cursor-pointer leading-tight"
                @click="toRegister">注册账号</span>
          <a-divider type="vertical" class="mx-5 bg-divider h-28px"/>
        </template>
        <a-tooltip
            :visible="isFirstStart"
            placement="bottom"
            overlayClassName="first-start-tooltip">
          <template slot="title">
            <span>首次登陆请先设置服务器</span>
          </template>
          <a-badge v-if="hasNewVersion">
              <span slot="count"
                    class="text-white bg-active rounded-lg h-4 leading-none"
                    style="transform: translate(100%, -50%);font-size: 10px;width: 31px;">
                <span class="leading-tightest">NEW</span>
              </span>
            <span class="cursor-pointer leading-tight text-xs" @click="openSetting">服务器设置</span>
          </a-badge>
          <span v-else class="cursor-pointer leading-tight text-xs" @click="openSetting">服务器设置</span>
        </a-tooltip>
      </div>


    </div>
    <div class="login-footer flex  items-center">
      <div class="text-xs flex text-center leading-tight text-black9">
        点击登录则代表您同意
        <span class="text-indigo-light cursor-pointer">《用户协议》</span>
        和
        <span class="text-indigo-light cursor-pointer">《隐私政策》</span>
      </div>
    </div>
  </div>
</template>

<script>
import { cloneDeep, debounce } from 'lodash';
import { LOGIN_STORAGE } from '../../storage';
import { isCapsLockOn } from '../../utils';
import LoginHeader from './LoginHeader.vue';

const { shell } = require('electron');

export default {
  name       : 'YMSLoginFormContent',
  components : {
    LoginHeader,
  },
  data() {
    const dSearch = debounce((val = '') => {
      this.searchedAccounts = this.modifiedAccounts.filter((a) => a.account.indexOf(val) >= 0);
    }, 200);

    return {
      dSearch,
      isCapsLockOn     : false,
      isFirstStart     : false,
      preRmbPassword   : true,
      rawAccounts      : [],
      modifiedAccounts : [],
      searchedAccounts : [],
      loginData        : {
        account : '',
        pin     : '',
      },
    };
  },
  async mounted() {
    this.initRawAccounts();
    await this.$nextTick();
    if (this.isAutoLogin) this.handleLogin();
    this.isFirstStart = this.$storage.query(this.$storage.FIRST_START);
  },
  sketch : {
    ns    : 'account',
    props : [ 'serverType', 'rmbPassword', 'autoLogin', 'autoLoginDisabled', 'loginType' ],
  },
  computed : {
    isAutoLogin() {
      return this.autoLogin && !this.autoLoginDisabled && this.rmbPassword;
    },
    hasNewVersion() {
      // TODO check the status of update
      return false;
    },
  },
  methods : {
    handleLogin(e) {
      this.$dispatch('account.login', this.loginData);
    },
    toForget() { // 跳转到忘记密码页面
      shell.openExternal('https://meeting.ylyun.com/meeting/forget');
    },
    toRegister() { // 跳转到注册页面
      shell.openExternal('https://meeting.ylyun.com/enterprise/register');
    },
    toMeeting() {
      this.loginType = 'meeting';
    },
    deleteAccount(val) {
      this.$storage.deleteItem(LOGIN_STORAGE.ACCOUNT_LIST, val.account, 'account');
      this.initRawAccounts();
    },
    clearAccount() {
      this.$storage.deleteItem(LOGIN_STORAGE.ACCOUNT_LIST, this.rawAccounts.map((account) => account.id));
      this.initRawAccounts();
    },
    selectAccount(val) {
      this.updateForm(this.modifiedAccounts.find((a) => a.account === val));
    },
    searchAccount(val) {
      this.dSearch(val.trim());
    },

    initRawAccounts() {
      this.rawAccounts = (this.$storage.query(LOGIN_STORAGE.ACCOUNT_LIST) || []); // 得到最初的登陆历史记录
      this.modifyAccounts();
    },
    modifyAccounts() {
      this.modifiedAccounts = this.rawAccounts
        .filter((account) => account.type === this.serverType)
        .sort((account1, account2) => account2.lastLoginDate - account1.lastLoginDate);
      const otherAccounts = this.rawAccounts.filter((account) => account.type !== this.serverType);

      if (this.modifiedAccounts.length > 10 || otherAccounts.length > 10) {
        this.$storage.insert(LOGIN_STORAGE.ACCOUNT_LIST, [ ...this.modifiedAccounts.slice(0, 10), ...otherAccounts ]);
      }
      this.modifiedAccounts = cloneDeep(this.modifiedAccounts.slice(0, 10)) || [];
      this.updateForm(this.modifiedAccounts[0]);
      this.dSearch();
    },
    updateForm(data) {
      if (!data) data = {};
      this.loginData = {
        account : data.account,
        pin     : data.pin,
      };
      this.$model.account.proxy = data.proxy;
      this.$model.account.proxyPort = data.proxyPort;
      this.$model.account.server = this.serverType === 'cloud' ? data.server || 'yealinkvc.com' : data.server;
    },
    passwordInputted(event) {
      this.isCapsLockOn = isCapsLockOn(event);
    },
    openSetting() {
      this.$storage.update(this.$storage.FIRST_START, false)
      this.isFirstStart = false;
      this.isCapsLockOn = false;
      this.$emit('openSetting');
    },

  },
  watch : {
    serverType() { // f服务器类型发生变化
      if (this.modifiedAccounts.length <= 0) { // 没有联系人则从数据库重新获取
        this.initRawAccounts();
      }
      else { // 重新设置 searchResult
        this.modifyAccounts();
      }
    },
    autoLogin(val) {
      if (val) {
        this.preRmbPassword = this.rmbPassword;
        this.rmbPassword = true;
      }
      else {
        this.rmbPassword = this.preRmbPassword;
      }
    },
    rmbPassword(val) {
      if (!val && this.autoLogin) {
        this.rmbPassword = true;
      }
    },
  },
};
</script>

<style lang="less">
  #login-form-content{
    height: 100%;
    .mt-48px{
      margin-top: 48px;
    }
    .mt-24px {
      margin-top: 24px;
    }
    .h-28px {
      height: 28px;
    }
    .content {
      justify-content: center;
      align-items: center;
      height: 100%;
      .login-form {
        width: 55%;
        .ant-form-item-control {
          line-height: unset;
        }
      }
    }
    .login-title {
      font-size: 24px;
      font-weight: bold;
      display: flex;
      align-items: flex-end;
      justify-content: left;
      width: 55%;
      padding-bottom: 48px;
    }

    .login-footer {
      height: 40px;
      width: 100%;
      background: #F0F2F8;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      bottom: 0;
    }
    .ant-form-item{
      margin-bottom: 12px;
      .ant-input {
        padding-left: 36px;
      }
    }
  }
  .first-start-tooltip {
    .ant-tooltip-content {
      .ant-tooltip-arrow {
        border-bottom-color: #d7def3;
      }
      .ant-tooltip-inner {
        background-color: #d7def3;
        font-size: 12px;
        color: #4A5FC4;
        text-align: center;
        line-height: 20px;
      }
    }
  }
</style>
