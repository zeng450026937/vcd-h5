<template>
  <div id="login-form-content">

    <div class="flex flex-col content">
      <div class="login-title">
        <span>{{$t('login.login')}}</span>
      </div>

      <div class="login-form flex flex-col" @keyup.enter="handleLogin">
        <div class="flex mb-6 select-none" v-if="isCloud">
          <div class="cloud-tab-normal"
               :class="{'cloud-tab-active': isLoginByPhone}"
               @click="toLoginByPhone">
            <span>手机登录</span>
          </div>
          <div class="cloud-tab-normal mx-6"
               :class="{'cloud-tab-active': isLoginByEmail}"
               @click="toLoginByEmail">
            <span>邮箱登录</span>
          </div>
          <div class="cloud-tab-normal"
               :class="{'cloud-tab-active': isLoginByCloud}"
               @click="toLoginByCloud">
            <span>云账号登录</span>
          </div>
        </div>
        <div class="mb-4 flex">
          <a-select v-if="isLoginByPhone"
                    defaultValue="+86"
                    style="width: 80px"
                    class="mr-3">
            <a-select-option value="+86">+86</a-select-option>
            <a-select-option value="+110">+110</a-select-option>
            <a-select-option value="+114">+114</a-select-option>
          </a-select>
          <account-auto-complete
              class="flex flex-grow"
              label="principle"
              :format="isLoginByPhone"
              :pattern="accountType"
              :prefixIcon="accountInput.icon"
              :placeholder="accountInput.placeholder"
              :account="loginData.principle"
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
              <a-button @click="toJoinConferencePage" block>{{$t('login.join')}}</a-button>
            </div>
          </div>
        </div>

      </div>

      <div class="text-xs text-center text-black6 mt-12 h-7">
        <template v-if="isCloud">
          <span class="cursor-pointer leading-tight"
                @click="toForget">{{$t('login.forgetPassword')}}</span>
          <a-divider type="vertical" class="mx-5 bg-divider h-7"/>
          <span class="cursor-pointer leading-tight"
                @click="toRegister">{{$t('login.regist')}}</span>
          <a-divider type="vertical" class="mx-5 bg-divider h-7"/>
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
    <enterprise-selector ref="enterpriseSelector" @selected="loginWithEnterprise"/>
  </div>
</template>

<script>
import { cloneDeep, debounce } from 'lodash';
import { isCapsLockOn } from '../../utils';
import AccountAutoComplete from './AccountAutoComplete.vue';
import EnterpriseSelector from './EnterpriseSelector.vue';
import { $t } from '../../i18n';

export default {
  name       : 'YMSLoginFormContent',
  components : {
    AccountAutoComplete,
    EnterpriseSelector,
  },
  data() {
    const dSearch = debounce((val = '') => {
      this.searchedAccounts = this.modifiedAccounts.filter((a) => a.principle.indexOf(val) !== -1);
    }, 200);

    return {
      dSearch,
      isCapsLockOn     : false,
      isMultiAccount   : false,
      preRmbPassword   : true,
      rawAccounts      : [],
      modifiedAccounts : [],
      searchedAccounts : [],
    };
  },
  sketch : {
    computed : [
      {
        ns    : 'login.account',
        props : [ 'loginData', 'rmbPassword' ],
      },
      {
        ns    : 'login.sketch',
        props : [ 'isCloud', 'isYMS', 'serverType', 'cloudType', 'accountType', 'isLoginByPhone', 'isLoginByEmail', 'isLoginByCloud' ],
      },
      {
        ns    : 'login.state',
        props : [ 'isFirstStart', 'autoLogin', 'autoLoginDisabled' ],
      },
      {
        ns    : 'updater',
        props : [ 'hasNewVersion' ],
      },
    ],
    methods : [
      {
        ns    : 'login.sketch',
        props : [ 'toLoginByPhone', 'toLoginByEmail', 'toLoginByCloud', 'toJoinConferencePage' ],
      },
    ],
  },
  computed : {
    isAutoLogin() {
      return this.autoLogin && !this.autoLoginDisabled && this.rmbPassword;
    },
    accountInput() {
      const INPUT_MAP = {
        YMS : {
          icon        : 'icon-ren2',
          placeholder : $t('login.placeholder.account'),
        },
        PHONE : {
          icon        : 'icon-dianhua',
          placeholder : $t('login.placeholder.phone'),
        },
        EMAIL : {
          icon        : 'icon-mail',
          placeholder : $t('login.placeholder.email'),
        },
        CLOUD : {
          icon        : 'icon-cloud',
          placeholder : $t('login.placeholder.cloud'),
        },
      };

      return INPUT_MAP[this.accountType.toUpperCase()];
    },
  },
  async mounted() {
    this.initRawAccounts();
    await this.$nextTick();
    if (this.isAutoLogin) this.handleLogin();
  },
  methods : {
    async handleLogin(e) {
      if (this.isYMS) {
        this.loginData.authorization = this.loginData.principle;

        return this.$dispatch('login.login');
      }

      const { accountInfos } = await this.$model.digest.$dispatch('digest.loadAccount', {
        username : this.loginData.principle,
        password : this.loginData.pin,
      });

      if (accountInfos.length === 0) {
        return this.$message.warning('账号输入错误');
      }
      if (accountInfos.length > 1) {
        this.$refs.enterpriseSelector.accountInfos = accountInfos;

        return this.$refs.enterpriseSelector.visible = true;
      }
      this.loginWithEnterprise(accountInfos[0]);
    },
    async loginWithEnterprise(info) {
      const { accountInfo, partyInfo } = info;

      await this.$model.digest.$dispatch('digest.getToken', { id: accountInfo.id });
      Object.assign(this.loginData, {
        account : accountInfo.extension,
        pin     : this.loginData.pin,
        server  : partyInfo.domain,
      });
      this.loginData.authorization = accountInfo.principle;

      this.$model.login.account.proxy = '10.200.112.65';
      this.$dispatch('login.login');
    },
    clearAccount() {
      this.$dispatch('login.account.clearAccount', this.modifiedAccounts.map((account) => account.id)).then(this.initRawAccounts);
    },
    updateAccount(val) {
      this.loginData.principle = val;
    },
    selectAccount(val) {
      this.updateForm(this.modifiedAccounts.find((a) => a.principle === val));
    },
    searchAccount(val) {
      this.dSearch(val.trim());
    },
    deleteAccount(val) {
      this.$dispatch('login.account.deleteAccount', val.principle).then(this.initRawAccounts);
    },
    initRawAccounts() {
      this.$dispatch('login.account.getRawAccounts').then((val) => {
        this.rawAccounts = val;
        this.modifyAccounts();
      });
    },
    modifyAccounts() {
      this.modifiedAccounts = this.rawAccounts
        .filter((account) => account.type === this.accountType)
        .sort((account1, account2) => account2.lastLoginDate - account1.lastLoginDate);
      const otherAccounts = this.rawAccounts.filter((account) => account.type !== this.accountType);

      if (this.modifiedAccounts.length > 10 || otherAccounts.length > 10) {
        this.$dispatch('login.account.updateAccounts', [ ...this.modifiedAccounts.slice(0, 10), ...otherAccounts ]);
      }
      this.modifiedAccounts = cloneDeep(this.modifiedAccounts.slice(0, 10)) || [];
      this.updateForm(this.modifiedAccounts[0]);
      this.dSearch();
    },
    updateForm(data) {
      if (!data) data = {};
      Object.keys(this.loginData).forEach((k) => this.loginData[k] = data[k]);
      this.$model.login.account.proxy = data.proxy;
      this.$model.login.account.proxyPort = data.proxyPort;
      this.loginData.server = this.loginData.server || (this.isCloud ? 'yealinkvc.com' : '');
    },
    passwordInputted(event) {
      this.isCapsLockOn = isCapsLockOn(event);
    },
    openSetting() {
      this.isFirstStart = false;
      this.isCapsLockOn = false;
      this.$emit('openSetting');
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
  },
  watch : {
    accountType() { // f服务器类型发生变化
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
  beforeDestroy() {
    this.isFirstStart = false;
  },
};
</script>

<style lang="less">
  #login-form-content{
    @apply h-full flex flex-col bg-white shadow w-full relative;
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
