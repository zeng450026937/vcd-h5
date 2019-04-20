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
              label='姓名'
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input placeholder='请输入姓名'
                     maxlength="64"
                     v-decorator="[
                          'name',
                          {rules: [
                              { required: true, message: '请输入用户姓名!' },
                              { max: 64, message: '用户名不能超过64位!' }
                           ],
                          }
                         ]"/>
          </a-form-item>

          <a-form-item
              label='账号'
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input placeholder='请输入账号'
                     maxlength="20"
                     v-decorator="[
                          'number',
                          {rules: [
                              { required: true, message: '请输入账号!' },
                              { max: 20, message: '账号不能超过20位!' }
                           ]}
                         ]"/>
          </a-form-item>
          <a-form-item
              label='手机'
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input placeholder='请输入手机号'
                     maxlength="11"
                     v-decorator="[
                          'phone',
                          {
                            rules: [
                              { max: 11, message: '手机号不能超过11位!' },
                              { pattern: /^1[3|4|5|7|8][0-9]{9}$/, message: '手机号格式不正确!'}
                            ],
                            validateTrigger : 'blur'
                          }
                         ]"/>
          </a-form-item>
          <a-form-item
              label='邮箱'
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input placeholder='请输入邮箱'
               maxlength="64"
               v-decorator="[
                'email',
                {
                  rules: [
                    { max: 254, message: '邮箱不能超过254位!' },
                    { pattern: /^.+@((.+)*\.).+$/, message: '邮箱格式不正确!'}
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
                      @click="handleSubmit">确定</a-button>
            <a-button class="mx-2" @click="visible = false">取消</a-button>
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
        'add-as' : '添加为本地联系人',
        add      : '添加本地联系人',
        edit     : '编辑本地联系人',
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
        }
        else {
          this.newLocalContact.id = this.editedContact.id;
          await this.$dispatch('contact.local.updateData', this.newLocalContact);
        }
        this.visible = false;
        this.$message.success('操作成功');
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
