<template>
  <div id="login-form-content" class="flex flex-col bg-white shadow w-full h-full relative">

    <div class="flex flex-col content">
      <div class="login-title">
        <span>{{$t('login.login')}}</span>
      </div>

      <div class="login-form flex flex-col" @keyup.enter="handleLogin">
        <div class="flex mb-6 select-none" v-if="serverType === 'cloud'">
          <div class="cloud-tab-normal"
               :class="{'cloud-tab-active': cloudType === 'phone'}"
                @click="cloudType = 'phone'">
            <span>手机登录</span>
          </div>
          <div class="cloud-tab-normal mx-6"
               :class="{'cloud-tab-active': cloudType === 'email'}"
               @click="cloudType = 'email'">
            <span>邮箱登录</span>
          </div>
          <div class="cloud-tab-normal"
               :class="{'cloud-tab-active': cloudType === 'cloud'}"
               @click="cloudType = 'cloud'">
            <span>云账号登录</span>
          </div>
        </div>
        <div class="mb-4 flex">
          <a-select v-if="accountType === 'phone'"
                    defaultValue="+86"
                    style="width: 80px"
                    class="mr-3">
              <a-select-option value="+86">+86</a-select-option>
              <a-select-option value="+110">+110</a-select-option>
              <a-select-option value="+114">+114</a-select-option>
          </a-select>
          <account-auto-complete
              class="flex flex-grow"
              :format="accountType !== 'email'"
              :prefixIcon="accountInput.icon"
              :placeholder="accountInput.placeholder"
              :account="loginData.account"
              :searched-accounts="searchedAccounts"
              @clearAccount="clearAccount"
              @updateAccount="updateAccount"
              @selectAccount="selectAccount"
              @searchAccount="searchAccount"
              @deleteAccount="deleteAccount"
          ></account-auto-complete>
        </div>

        <!--<template v-if="serverType === 'yms'">-->
          <div class="mb-4">
            <a-input
                v-model="loginData.pin"
                maxlength="64"
                @keypress="passwordInputted"
                type="password"
                :placeholder="$t('login.placeholder.password')">
              <div slot="prefix">
                <a-tooltip
                    :visible="isCapsLockOn"
                    trigger="focus"
                    placement="bottomLeft">
                  <template slot="title">
                    <span>{{$t('login.capitalLocked')}}</span>
                  </template>
                  <a-iconfont type='icon-mima' class="text-base text-black9"/>
                </a-tooltip>
              </div>
            </a-input>
          </div>

        <div class="flex justify-between mt-6">
          <a-checkbox class="text-xs text-black6"
                      :checked="rmbPassword"
                      @change="rmbPassword = !rmbPassword"
          >{{$t('login.rememberPassword')}}
          </a-checkbox>
          <a-checkbox class="text-xs text-black6"
                      :checked="autoLogin"
                      @change="autoLogin = !autoLogin"
          > {{$t('login.autoLogin')}}
          </a-checkbox>
        </div>

        <div class="mt-9">
          <div class="flex">
            <div class="w-1/2 mr-2">
              <a-button type="primary" block @click="handleLogin">{{$t('login.login')}}</a-button>
            </div>
            <div class="w-1/2 ml-2">
              <a-button @click="toMeeting" block>{{$t('login.join')}}</a-button>
            </div>
          </div>
        </div>

      </div>

      <div class="text-xs text-center text-black6 mt-12 h-28px">
        <template v-if="serverType === 'cloud'">
          <span class="cursor-pointer leading-tight"
                @click="toForget">{{$t('login.forgetPassword')}}</span>
          <a-divider type="vertical" class="mx-5 bg-divider h-28px"/>
          <span class="cursor-pointer leading-tight"
                @click="toRegister">{{$t('login.regist')}}</span>
          <a-divider type="vertical" class="mx-5 bg-divider h-28px"/>
        </template>
        <a-tooltip
            :visible="isFirstStart"
            placement="bottom"
            overlayClassName="first-start-tooltip">
          <template slot="title">
            <span>{{$t('login.firstLogin')}}</span>
          </template>
          <a-badge v-if="hasNewVersion">
              <span slot="count"
                    class="text-white bg-active rounded-lg h-2 leading-none"
                    style="transform: translate(50%, -250%);font-size: 10px;width: 8px;">
                <span class="leading-tightest"></span>
              </span>
            <span class="cursor-pointer leading-tight text-xs" @click="openSetting">
              {{$t('login.serverSetting')}}
            </span>
          </a-badge>
          <span v-else class="cursor-pointer leading-tight text-xs" @click="openSetting">
            {{$t('login.serverSetting')}}
          </span>
        </a-tooltip>
      </div>


    </div>
    <div class="login-footer flex  items-center">
      <div class="text-xs flex text-center leading-tight text-black9">
        {{$t('login.clickAgree')}}
        <span class="text-indigo-light cursor-pointer" @click="goUserProtocol">{{$t('login.userProtocol')}}</span>
        {{$t('login.and')}}
        <span class="text-indigo-light cursor-pointer" @click="goPrivacy">{{$t('login.privacyPolicy')}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { cloneDeep, debounce } from 'lodash';
import { LOGIN_STORAGE } from '../../storage';
import { isCapsLockOn } from '../../utils';
import LoginHeader from './LoginHeader.vue';
import AccountAutoComplete from './AccountAutoComplete.vue';
import { $t } from '../../i18n';

export default {
  name       : 'YMSLoginFormContent',
  components : {
    LoginHeader,
    AccountAutoComplete,
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
  sketch : [
    {
      ns    : 'account',
      props : [ 'serverType', 'rmbPassword', 'autoLogin',
        'autoLoginDisabled', 'loginType', 'cloudType' ],
    },
    {
      ns    : 'i18n',
      props : [ 'language' ],
    },
  ],
  computed : {
    isAutoLogin() {
      return this.autoLogin && !this.autoLoginDisabled && this.rmbPassword;
    },
    status() {
      return this.$model.updater.status;
    },
    hasNewVersion() {
      return this.status === 1 || this.status === 3 || this.status === 4;
    },
    accountType() {
      // 账号类型 yms phone email cloud
      return this.serverType === 'yms' ? 'yms' : this.cloudType;
    },
    accountInput() {
      const INPUT_MAP = {
        yms : {
          icon        : 'icon-ren2',
          placeholder : $t('login.placeholder.account'),
        },
        phone : {
          icon        : 'icon-dianhua',
          placeholder : $t('login.placeholder.phone'),
        },
        email : {
          icon        : 'icon-mail',
          placeholder : $t('login.placeholder.email'),
        },
        cloud : {
          icon        : 'icon-cloud',
          placeholder : $t('login.placeholder.cloud'),
        },
      };

      
      return INPUT_MAP[this.accountType];
    },

  },
  methods : {
    handleLogin(e) {
      if (this.serverType === 'cloud') {
        if (this.cloudType === 'phone') {
          // 电话
        }
      }
      this.$dispatch('account.login', this.loginData);
    },
    toForget() { // 跳转到忘记密码页面
      this.$dispatch('application.openExternal', { path: 'https://meeting.ylyun.com/meeting/forget' });
    },
    toRegister() { // 跳转到注册页面
      this.$dispatch('application.openExternal', { path: 'https://meeting.ylyun.com/enterprise/register' });
    },
    goUserProtocol() {
      const path = this.language === 'zh'
        ? 'https://www.yealink.com.cn/onepage_30.html'
        : 'https://www.yealink.com/onepage_67.html';

      this.$dispatch('application.openExternal', { path });
    },
    goPrivacy() {
      const path = this.language === 'zh'
        ? 'https://www.yealink.com.cn/onepage_24.html'
        : 'https://www.yealink.com/onepage_66.html';

      this.$dispatch('application.openExternal', { path });
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
    updateAccount(val) {
      this.loginData.account = val;
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
        .filter((account) => account.type === this.accountType)
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
      this.$storage.update(this.$storage.FIRST_START, false);
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
    cloudType() {
      if (this.serverType === 'cloud') {
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
  beforeDestroy() {
    this.$storage.update(this.$storage.FIRST_START, false);
    this.isFirstStart = false;
  },
};
</script>

<style lang="less">
  #login-form-content{
    @apply h-full;
    .h-28px {
      height: 28px;
    }
    > .content {
      @apply justify-center items-center h-1 flex-grow;
      .login-form {
        width: 55%;
        .cloud-tab {
          &-normal {
            @apply pb-2 leading-loose cursor-pointer;
          }
          &-active {
            @apply border-b-2 border-indigo text-indigo;
          }
        }
        .ant-form-item-control {
          @apply leading-none;
        }
      }
    }
    .login-title {
      width: 55%;
      padding-bottom: 48px;
      @apply text-2xl font-semibold flex items-end justify-start;
    }

    .login-footer {
      @apply h-10 w-full bg-under-painting flex items-center justify-center;
    }
    .ant-input {
      @apply pl-9;
    }
  }
  .first-start-tooltip {
    .ant-tooltip-content {
      .ant-tooltip-arrow {
        border-bottom-color: #d7def3;
      }
      .ant-tooltip-inner {
        background-color: #d7def3;
        @apply text-xs text-indigo text-center leading-tight;
      }
    }
  }
</style>
