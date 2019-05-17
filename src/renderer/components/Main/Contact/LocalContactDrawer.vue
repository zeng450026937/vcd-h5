<template>
  <a-drawer
      placement="right"
      :width="360"
      :closable="false"
      @close="visible = false"
      :visible="visible"
      wrapClassName="local-contact-drawer"
  >
    <div class="flex flex-col h-full w-full">
      <div class="ant-drawer-header px-4 items-center">
        <div class="ant-drawer-title flex flex-grow">{{drawerTitle}}</div>
      </div>

      <div class="flex flex-col px-5 pt-4 flex-grow overflow-y-auto">
        <a-form class="add-local-contact-form" :form="form">
          <a-form-item
              :label="$t('contact.label.name')"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input :placeholder="$t('contact.placeholder.inputName')"
                     maxlength="64"
                     v-decorator="[
                          'name',
                          {rules: [
                              { required: true, message: $t('contact.message.inputName') },
                              { max: 64, message: $t('contact.message.nameNoLess64') }
                           ],
                          }
                         ]"/>
          </a-form-item>

          <a-form-item
              :label="$t('contact.label.account')"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input :placeholder="$t('contact.placeholder.inputAccount')"
                     maxlength="20"
                     v-decorator="[
                          'number',
                          {rules: [
                              { required: true, message: $t('contact.message.inputAccount') },
                              { max: 20, message: $t('contact.message.accountNoLess20') }
                           ]}
                         ]"/>
          </a-form-item>
          <a-form-item
              :label="$t('contact.label.phone')"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input :placeholder="$t('contact.placeholder.inputPhone')"
                     maxlength="11"
                     v-decorator="[
                          'phone',
                          {
                            rules: [
                              { max: 11, message: $t('contact.message.phoneNoMore11') },
                              { pattern: /^1[3|4|5|7|8][0-9]{9}$/, message: $t('contact.message.wrongPhoneNumber')}
                            ],
                            validateTrigger : 'blur'
                          }
                         ]"/>
          </a-form-item>
          <a-form-item
              :label="$t('contact.label.email')"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input :placeholder="$t('contact.placeholder.inputEmail')"
               maxlength="64"
               v-decorator="[
                'email',
                {
                  rules: [
                    { max: 254, message: $t('contact.message.emailNoMore254') },
                    { pattern: /^.+@((.+)*\.).+$/, message: $t('contact.message.wrongEmail')}
                  ],
                  validateTrigger : 'blur'
                 }
               ]"/>
          </a-form-item>
        </a-form>
      </div>
      <div class="flex h-12">
        <div class="w-full flex py-2 border-t justify-center">
            <a-button type="primary"
                      class="mx-2"
                      htmlType="submit"
                      @click="handleSubmit">{{$t('contact.button.confirm')}}</a-button>
            <a-button class="mx-2" @click="visible = false">{{$t('contact.button.cancel')}}</a-button>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import CommonHeader from '../../Shared/CommonHeader.vue';

export default {
  name       : 'LocalContactDrawer',
  components : {
    CommonHeader,
  },
  props : {
    type : { // add edit add-as
      type    : String,
      default : 'add',
    },
  },
  data() {
    return {
      visible         : false,
      form            : this.$form.createForm(this),
      labelCol        : { span: 5 },
      wrapperCol      : { span: 19 },
      newLocalContact : {},
      editedContact   : {},
    };
  },
  computed : {
    drawerTitle() {
      return {
        'add-as' : this.$t('contact.local.title.addAs'),
        add      : this.$t('contact.local.title.add'),
        edit     : this.$t('contact.local.title.edit'),
      }[this.type];
    },
  },
  methods : {
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields(async(err, values) => {
        if (err) return;
        this.newLocalContact = values;
        this.newLocalContact.nick = /^(.*)\(.*\)$/.test(values.name) ? RegExp.$1.substr(-2, 2) : values.name.substr(-2, 2);
        if (this.type === 'add' || this.type === 'add-as') {
          await this.$dispatch('contact.local.insertData', this.newLocalContact);
          this.$message.success(this.$t('contact.message.success'));
        }
        else {
          this.newLocalContact.id = this.editedContact.id;
          await this.$dispatch('contact.local.updateData', this.newLocalContact);
          this.$message.success(this.$t('contact.message.editSucceed'));
        }
        this.visible = false;
        this.$emit('submit-success');
      });
    },
  },
  watch : {
    type(val) {
      if (val === 'add' || val === 'add-as') {
        this.form.setFieldsValue({ number: '', email: '', name: '', phone: '' });
      }
    },
    editedContact(val) {
      if (val && this.type === 'edit') {
        const { number, email, name, phone } = val;

        this.form.setFieldsValue({ number, email, name, phone });
      }
    },
  },
};
</script>

<style lang="less">
  .local-contact-drawer {
    .ant-drawer-wrapper-body {
      display: flex;
      flex-direction: column;
    }
    .ant-drawer-header {
      display: flex;
      padding: 0;
      height: 48px;
      .ant-drawer-title {
        font-size: 16px;
        color: #333333;
        line-height: 24px;
        font-weight: 600;
      }
    }
    .ant-drawer-body {
      display: flex;
      height: 100%;
      padding: 0;
    }
  }

  .add-local-contact-form {
    .ant-form-item-label {
      text-align: center;
      label {
        padding-left: 4px;
        &::before {
          position: absolute;
          top: 2px;
          left: -8px;
          font-size: 16px;
          color: #FF5050;
        }
        &::after {
          content: none;
        }
      }
    }

    .ant-form-item {
      margin-bottom: 14px;
    }
  }
</style>
