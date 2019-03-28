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
    <div class="flex flex-col border h-full m-4 bg-white p-5 overflow-y-hide">
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
          <a-form-item>
            <span>{{$t('setting.common.address')}}</span>
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
              }
              ]"
              class="ml-4 w-48" 
              :placeholder="$t('setting.common.addressPlaceHolder')"
            />
          </a-form-item>
        </a-form>
        
      </div>
      <div class="mt-2">
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
            <template v-for="(tag,index) in tags">
              <a-tag :key="index" closable @close="handleDeleteProperty(index)" color="gray">{{tag}}</a-tag>
            </template>
            <a-tag  style="borderStyle: dashed;" @click="showAddPropetyInput=true" 
              v-if="tags.length<=20">
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
  </a-layout>
</template>

<script>
import { isURL } from 'validator';
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
      if (this.addPropertyText.trim() !== '') {
        if (this.tags.length < 20) {
          this.showAddPropetyInput = false;
          this.tags.push(this.addPropertyText);
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
      const tag = this.tags[index];

      this.tags.splice(index, 1);

      this.$message.success(`${tag} ${this.$t('setting.common.deletePropertyNotice')}`);
    },
  },
};
</script>
<style scope>

</style>
