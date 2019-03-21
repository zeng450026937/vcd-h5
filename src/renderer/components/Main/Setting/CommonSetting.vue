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
    <div class="flex flex-col border h-full m-4 bg-white p-5 overflow-y-auto">
      <div class="overflow-y-auto">
        <div>
          <a-switch size="small" v-model="autoStart"/>
          <span class="ml-5">{{$t('setting.common.autoStart')}}</span>
        </div>
        <div class="mt-4">
          <a-switch size="small" v-model="hideWhenClose"/>
          <span class="ml-5">{{$t('setting.common.forceMinimize')}}</span>
        </div>
        <div class="mt-6">
          <span>{{$t('setting.common.language')}}</span>
          <a-select v-model="language" class="w-48 ml-4" @change="handleLanguageChange">
            <a-select-option v-for="(lang, index) in langList" :key="index"
                             :value="lang.lang"
            >{{lang.label}}</a-select-option>
          </a-select>
        </div>
        <div class="mt-6">
          
          <a-form :form="form">
            <div class="mt-2 inline-block">{{$t('setting.common.address')}}</div>
            <a-form-item class="ml-4">
              <a-input
                v-decorator="[ 
                'ytmsHostAddress',
                { 
                  validateTrigger: 'blur',
                  rules: [
                  { validator: validateAddress, message: addressErrorText }
                  ] 
                }
                ]"
                class="w-48" 
                :placeholder="$t('setting.common.addressPlaceHolder')"
              />
            </a-form-item>
          </a-form>
          
        </div>
        <div class="mt-3">
          <span>{{$t('setting.common.updateChannel')}}</span>
          <a-select v-model="updateChannel" class="w-48 ml-4">
            <a-select-option v-for="(channel, index) in updateChannelList" :key="index"
                             :value="channel.value"
            >{{channel.label}}</a-select-option>
          </a-select>
        </div>
        <div class="mt-8 flex align-top">
          <div class="mt-2">{{$t('setting.common.property')}}</div>
          <div class="ml-4 flex-1">
            <div v-if="showAddPropetyInput" class="mb-2">
              <a-input v-model="addPropertyText"  maxlength="64"  class="w-60"
                       @keypress.enter="handleAddProperty"></a-input>
              <a-button type="primary" class="ml-2" shape="circle" size="small"
                        icon="check" @click="handleAddProperty"></a-button>
              <a-button type="danger" class="ml-2" shape="circle" icon="close" size="small"
                        @click="showAddPropetyInput=false" ></a-button>
            </div>
            <div class="mt-2">
              <a-tooltip v-for="(item,index) in propertyList" :key="item.id">
                <template slot="title">
                  <span>{{$t('setting.common.propertyCreateAt')+item.createdAt}}</span>
                </template>
                <a-tag closable @close="handleDeleteProperty(index)" >{{item.label}}</a-tag>
              </a-tooltip>
              <a-tag  color="blue"  style="borderStyle: dashed;" @click="showAddPropetyInput=true" 
                v-if="propertyList.length<=20">
                  <span>+ {{$t('setting.common.addProperty')}}</span>
              </a-tag>
              <a-tag v-else color="gray">
                {{$t('setting.common.fullPropertyNotice')}}
              </a-tag>
            </div>
          </div>
        </div>
        <div class="mt-10">
          <a-button type="primary" class="w-32" @click="handleNoodGuide">{{$t('setting.common.noobGuide')}}</a-button>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';
import { langList } from '../../../i18n/config';

export default {
  name : 'CommonSetting',

  components : {
    AppHeader,
  },
  
  data() {
    return {
      langList : Object.keys(langList).map((key) => (
        { 
          label : langList[key].remark,
          lang  : langList[key].locale, 
        }
      )),
      addressErrorText    : '您输入的地址不合法！',
      showAddPropetyInput : false,
      addPropertyText     : '',
    };
  },

  sketch : {
    ns    : 'setting',
    props : [ 
      'autoStart',
      'hideWhenClose',
      'language',
      'ytmsHostAddress',
      'updateChannel',
      'propertyList',
    ],
  },

  computed : {
    updateChannelList() {
      return [ 'insiders', 'faster', 'stable' ].map((key) => ({
        value : key,
        label : this.$t(`setting.common.updateChannelList.${key}`),
      }));
    },
  },

  created() {
    this.form = this.$form.createForm(this, {
      mapPropsToFields : () => ({
        ytmsHostAddress : this.$form.createFormField({
          value : this.ytmsHostAddress,
        }),
      }),
    });
    this.defaultProtocol = 'http';
    this.defaultPort = '9301';
  },
  
  deactivated() {
    this.$dispatch('setting.save');
  },

  destroyed() {
    this.$dispatch('setting.save');
  },

  methods : {
    validateAddress(rule, value, callback) {
      if (!value) {
        this.ytmsHostAddress = '';
        
        return callback();
      }

      const VALID_RE = /^((\w*:)?\/\/)?(\d{1,3}\.){3}(\d{1,3})((:(\d{1,4})?)?)$/;

      if (!VALID_RE.test(value)) return callback(new Error());

      const ADDRESS_RE = /(\d{1,3}\.){3}(\d{1,3})/;

      let address = ADDRESS_RE.exec(value)[0];

      const PROTOCOL_RE = /^\w+:\/\//;

      const protocol = PROTOCOL_RE.exec(value);

      if (protocol) {
        address = protocol[0] + address;
      }
      else {
        address = `${this.defaultProtocol}://${address}`;
      }

      const PORT_RE = /:\d{1,4}$/;
      const port = PORT_RE.exec(value);

      if (port) {
        address += port[0];
      }
      else {
        address += `:${this.defaultPort}`;
      }

      callback();
      
      this.ytmsHostAddress = address;
    },

    handleNoodGuide() {
      this.$message.warning('新手引导还没做完哦');
    },

    handleLanguageChange() {
      this.$i18n.locale = this.language;
      this.$message.success(`${this.$t('setting.common.langChangeNotice')} ${Object.values(langList).find((item) => item.locale === this.language).remark} !`);
    },
    
    handleAddProperty() {
      if (this.addPropertyText.trim() !== '') {
        if (this.propertyList.length < 20) {
          this.showAddPropetyInput = false;
          this.propertyList.push({
            label     : this.addPropertyText,
            id        : this.getNewPropertyId() + 1,
            createdAt : (new Date()).toLocaleString(),
          });
          this.addPropertyText = '';
          this.$message.success(this.$t('setting.common.addPropertyNotice'));
        }
        else {
          this.$message.error(this.$t('setting.common.fullPropertyNotice'));
        }
      }
      else {
        this.$message.error(this.$t('setting.common.emptyPropertyNotice'));
      }
    },
    handleDeleteProperty(index) {
      const deleteMsg = this.propertyList.splice(index, 1)[0].label;

      this.$message.success(`${deleteMsg} ${this.$t('setting.common.deletePropertyNotice')}`);
    },
    getNewPropertyId() {
      return this.propertyList.length ? this.propertyList[this.propertyList.length - 1].id : 0;
    },
  },
};
</script>
<style scope>
  .ant-form-item{
    display:inline-block;
  }
</style>
