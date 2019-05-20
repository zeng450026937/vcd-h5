<template>
  <a-layout id="common-setting" class="h-full">
    <app-header>
      <span slot="title"
            class="no-dragable select-none"
            @click="openAdvanceSetting">{{$t('setting.common.title')}}</span>
    </app-header>

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
          <a-select v-model="language" class="w-48 mt-3">
            <a-select-option v-for="(lang, index) in langList" :key="index"
                             :value="lang.lang"
            >{{lang.label}}</a-select-option>
          </a-select>
        </div>
        <template v-if="showAdvanceSetting">
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
              >{{channel.label}}
              </a-select-option>
            </a-select>
          </div>
          <div class="mt-5 align-top">
            <div class="mt-2">{{$t('setting.common.property')}}</div>
            <div class="flex-1">

              <div class="mt-3 flex flex-col">
                <template v-if="tags.length < 20">
                  <a-tag v-if="!showAddPropertyInput"
                         class="w-48 h-8 flex items-center justify-center"
                         style="borderStyle: dashed;"
                         @click="addProperty">
                    <div>
                      <a-iconfont type="icon-tianjia"/>
                      {{$t('setting.common.addProperty')}}
                    </div>
                  </a-tag>
                  <div v-show="showAddPropertyInput">
                    <a-input v-model="addPropertyText"
                             ref="propertyInput"
                             maxlength="64"
                             class="w-60"
                             @keypress.enter="handleAddProperty"></a-input>
                    <a-button type="primary" class="ml-2" shape="circle" size="small"
                              icon="check" @click="handleAddProperty"></a-button>
                    <a-button type="danger" class="ml-2" shape="circle" icon="close" size="small"
                              @click="showAddPropertyInput=false;addPropertyText='';"></a-button>
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
                                  class="ml-3 text-black6 hover:text-red cursor-pointer"></a-iconfont>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </a-layout>
</template>

<script>
import { isURL } from 'validator';
import AppHeader from '../../../components/Main/MainHeader.vue';

export default {
  name : 'CommonSetting',

  components : {
    AppHeader,
  },
  
  data() {
    return {
      addressErrorText     : this.$t('setting.common.invalidAddress'),
      showAddPropertyInput : false,
      addPropertyText      : '',
      count                : 0,
    };
  },
  sketch : [
    {
      ns    : 'setting',
      props : [
        'autoStart',
        'hideWhenClose',
        'ytmsHostAddress',
        'updateChannel',
        'tags',
        'showAdvanceSetting',
      ],
    },
    {
      ns    : 'i18n',
      props : [ 'language', 'langList' ],
    },
  ],

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
    language(val) {
      this.$i18n.locale = val;
      this.$dispatch('i18n.setMainLocale', { lang: val });
    },
  },
  
  deactivated() {
    this.$dispatch('setting.save');
  },

  destroyed() {
    this.$dispatch('setting.save');
    this.showAdvanceSetting = false;
  },

  methods : {
    openAdvanceSetting() {
      if (this.count++ === 8) {
        this.showAdvanceSetting = true;
      }
    },
    async addProperty() {
      this.showAddPropertyInput = true;
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
    handleAddProperty() {
      if (this.addPropertyText.trim() === '') return this.$message.warning((this.$t('setting.common.emptyPropertyNotice')));

      if (this.tags.length >= 20) return this.$message.warning(this.$t('setting.common.fullPropertyNotice'));

      if (this.tags.indexOf(this.addPropertyText) !== -1) return this.$message.warning((this.$t('setting.common.propertyExist')));

      this.showAddPropertyInput = false;
      this.tags.push(this.addPropertyText);
      this.addPropertyText = '';
      this.$message.success(this.$t('setting.common.addPropertyNotice'));
    },
    handleDeleteProperty(index) {
      console.warn('handleDeleteProperty', index);
      const tag = this.tags[index];

      this.tags.splice(index, 1);

      this.$message.success(this.$t('setting.common.deletePropertyNotice'));
    },
  },
};
</script>
<style scope>

</style>
