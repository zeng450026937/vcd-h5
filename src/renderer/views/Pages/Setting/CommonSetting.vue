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
      <div>
        <div>
          <a-switch size="small" v-model="autoStart"/>
          <span class="ml-3">{{$t('setting.common.autoStart')}}</span>
        </div>
        <div class="mt-3">
          <a-switch size="small" v-model="hideWhenClose"/>
          <span class="ml-3">{{$t('setting.common.forceMinimize')}}</span>
        </div>
        <div class="mt-5">
          <div>{{$t('setting.common.language')}}</div>
          <a-select v-model="language" class="w-48 mt-3" @change="handleLanguageChange">
            <a-select-option v-for="(lang, index) in langList" :key="index"
                             :value="lang.lang"
            >{{lang.label}}</a-select-option>
          </a-select>
        </div>
        <div class="mt-5">
          <a-form :form="form">
            <a-form-item class="mb-0">
              <div class="leading-none">{{$t('setting.common.address')}}</div>
              <a-input
                  v-decorator="[
                  'ytmsHostAddress',
                  {
                    validateTrigger: 'blur',
                    rules: [
                      {
                      validator: validateAddress,
                      message: addressErrorText,
                      }
                    ]
                  }]"
                  class="w-48 mt-3"
                  :placeholder="$t('setting.common.addressPlaceHolder')"
              />
            </a-form-item>
          </a-form>
        </div>
        <div class="mt-5">
          <div>{{$t('setting.common.updateChannel')}}</div>
          <a-select v-model="updateChannel" class="w-48 mt-3">
            <a-select-option v-for="(channel, index) in updateChannelList" :key="index"
                             :value="channel.value"
            >{{channel.label}}</a-select-option>
          </a-select>
        </div>
        <div class="mt-5 align-top">
        <div class="mt-2">{{$t('setting.common.property')}}</div>
        <div class="flex-1">

          <div class="mt-3 flex flex-col">
            <template v-if="tags.length < 20">
              <a-tag v-if="!showAddPropetyInput"
                     class="w-60 h-8 flex items-center justify-center"
                     style="borderStyle: dashed;"
                     @click="addPropety">
                <div>
                  <a-iconfont type="icon-tianjia"/>
                  {{$t('setting.common.addProperty')}}
                </div>
              </a-tag>
              <div v-show="showAddPropetyInput">
                <a-input v-model="addPropertyText"
                         ref="propertyInput"
                         maxlength="64"
                         class="w-60"
                         @keypress.enter="handleAddProperty"></a-input>
                <a-button type="primary" class="ml-2" shape="circle" size="small"
                          icon="check" @click="handleAddProperty"></a-button>
                <a-button type="danger" class="ml-2" shape="circle" icon="close" size="small"
                          @click="showAddPropetyInput=false;addPropertyText='';"></a-button>
              </div>
            </template>
            <a-tag v-else color="red" class="w-60 h-8 flex items-center justify-center">
              {{$t('setting.common.fullPropertyNotice')}}
            </a-tag>
            <div class="flex flex-wrap mt-3">
              <template v-for="(tag,index) in tags">
                <div class="h-8 mb-2 flex items-center justify-center bg-device-tag mr-3 px-4 rounded"
                     :key="index">
                  <span>{{tag}}</span>
                  <a-iconfont type="icon-guanbi"
                              @click="handleDeleteProperty(index)"
                              class="ml-3 text-black6 hover:text-red cursor-pointer"/>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import { isURL } from 'validator';
import AppHeader from '../../../components/Main/MainHeader.vue';
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
      'tags',
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

  watch : {
    ytmsHostAddress() {
      this.form.updateFields({
        ytmsHostAddress : this.$form.createFormField({
          value : this.ytmsHostAddress,
        }),
      });
    },
  },
  
  deactivated() {
    this.$dispatch('setting.save');
  },

  destroyed() {
    this.$dispatch('setting.save');
  },

  methods : {
    async addPropety() {
      this.showAddPropetyInput = true;
      await this.$refs.propertyInput.$nextTick();
      this.$refs.propertyInput.focus();
    },
    validateAddress(rule, value, callback) {
      if (!value) {
        this.ytmsHostAddress = '';
        
        return callback();
      }

      if (!isURL(value)) return callback(new Error());

      callback();

      this.ytmsHostAddress = value;
    },

    handleNoodGuide() {
      this.$message.warning('新手引导二期实现');
    },

    handleLanguageChange() {
      this.$i18n.locale = this.language;
      this.$message.success(`${this.$t('setting.common.langChangeNotice')} ${Object.values(langList).find((item) => item.locale === this.language).remark} !`);
    },
    
    handleAddProperty() {
      if (this.addPropertyText.trim() === '') return this.$message.error(this.$t('setting.common.emptyPropertyNotice'));

      if (this.tags.length >= 20) return this.$message.error(this.$t('setting.common.fullPropertyNotice'));

      if (this.tags.indexOf(this.addPropertyText) !== -1) return this.$message.error('已存在该标签');

      this.showAddPropetyInput = false;
      this.tags.push(this.addPropertyText);
      this.addPropertyText = '';
      this.$message.success(this.$t('setting.common.addPropertyNotice'));
    },
    handleDeleteProperty(index) {
      console.warn('handleDeleteProperty', index);
      const tag = this.tags[index];

      this.tags.splice(index, 1);

      this.$message.success(`${tag} ${this.$t('setting.common.deletePropertyNotice')}`);
    },
  },
};
</script>
<style scope>

</style>
