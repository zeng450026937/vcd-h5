<template>
  <a-layout id="common-setting" class="h-full">
    <div class="h-14 border-b">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>{{$t('setting.common.title')}}</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <div class="flex flex-col border h-full m-4 bg-white p-5">
      <div class="overflow-y-scroll">
        <div>
          <a-switch size="small" v-model="autoStart"/>
          <span class="ml-5">{{$t('setting.common.autoStart')}}</span>
        </div>
        <div class="mt-4">
          <a-switch size="small" v-model="forceMinimize"/>
          <span class="ml-5">{{$t('setting.common.forceMinimize')}}</span>
        </div>
        <div class="mt-6">
          <span>{{$t('setting.common.language')}}</span>
          <a-select v-model="language" class="w-48 ml-4">
            <a-select-option v-for="(lang, index) in langList" :key="index"
                             :value="lang.lang"
            >{{lang.label}}</a-select-option>
          </a-select>
        </div>
        <div class="mt-6">
          
          <a-form>
            <a-form-item :validateStatus="showAddressError?'error':''" :help="showAddressError?addressErrorText:''">
              <span>{{$t('setting.common.address')}}</span>
              <a-input v-model="addressInput" class="w-48 ml-4" :placeholder="$t('setting.common.addressPlaceHolder')" @blur="handleCheckAddress"/>
            </a-form-item>
          </a-form>
          
        </div>
        <div class="mt-6">
          <span>{{$t('setting.common.updateChannel')}}</span>
          <a-select v-model="updateChannel" class="w-48 ml-4">
            <a-select-option v-for="(channel, index) in updateChannelList" :key="index"
                             :value="channel.value"
            >{{channel.label}}</a-select-option>
          </a-select>
        </div>
        <div class="mt-10">
          <a-button type="primary" class="w-32">{{$t('setting.common.noobGuide')}}</a-button>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';
import { langList } from '../../../i18n/config';

export default {
  name       : 'CommonSetting',
  components : {
    AppHeader,
  },
  data() {
    return {
      // updateChannelList : [
      //   { label: '快速', value: 'insiders' },
      //   { label: '慢速', value: 'faster' },
      //   { label: '稳定', value: 'stable' },
      // ],
      langList : Object.keys(langList).map((key) => (
        { 
          label : langList[key].remark,
          lang  : langList[key].locale, 
        }
      )),
      addressInput     : '',
      showAddressError : false,
      addressErrorText : '您输入的地址不合法！',
      defaultProtocol  : 'https://',
      defaultPort      : ':9301',
    };
  },
  created() {
    this.addressInput = this.address;
  },
  computed : {
    updateChannelList() {
      return [ 'insiders', 'faster', 'stable' ].map((key) => ({
        value : key,
        label : this.$t(`setting.common.updateChannelList.${key}`),
      }));
    },
  },
  sketch : {
    ns    : 'setting1.common',
    props : [ 'autoStart', 'forceMinimize', 'language', 'address', 'updateChannel' ],
  },
  deactivated() {
    this.$model.setting1.save('common'); // 页面不显示的时候保存设置
  },
  destroyed() {
    this.$model.setting1.save('common'); // 页面不显示的时候保存设置
  },
  methods : {
    handleCheckAddress() {
      if (/^((\w*:)?\/\/)?(\d{1,3}\.){3}(\d{1,3})((:(\d{1,4})?)?)$/.test(this.addressInput)) {
        let newAddress = /(\d{1,3}\.){3}(\d{1,3})/.exec(this.addressInput)[0];

        const protocolTest = /^\w+:\/\//.exec(this.addressInput);

        if (protocolTest) {
          newAddress = protocolTest[0] + newAddress;
        }
        else {
          newAddress = this.defaultProtocol + newAddress;
        }

        const portTest = /:\d{1,4}$/.exec(this.addressInput);

        if (portTest) {
          newAddress += portTest[0];
        }
        else {
          newAddress += this.defaultPort;
        }
        this.addressInput = this.address = newAddress;
        this.showAddressError = false;
      }
      else {
        this.showAddressError = true;
        this.addressErrorText = '您输入的地址不合法！';
      }
    },
  },
};
</script>
