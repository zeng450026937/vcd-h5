<template>
  <a-drawer
      :title="drawerTitle"
      placement="right"
      :width="357"
      :closable="false"
      @close="visible = false"
      :visible="visible"
      wrapClassName="local-contact-drawer"
  >
    <div class="flex flex-col h-full w-full">
      <div class="flex flex-col px-5 pt-4 flex-grow overflow-y-auto">
        <a-form class="add-local-contact-form" :form="form">
          <a-form-item
              label='姓名'
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input placeholder='请输入姓名'
                     v-decorator="[
                          'name',
                          {rules: [{ required: true, message: '请输入用户姓名!' }]}
                         ]"/>
          </a-form-item>

          <a-form-item
              label='账号'
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input placeholder='请输入账号'
                     v-decorator="[
                          'number',
                          {rules: [{ required: true, message: '请输入账号!' }]}
                         ]"/>
          </a-form-item>
          <a-form-item
              label='手机'
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input placeholder='请输入手机号'
                     v-decorator="['phone']"/>
          </a-form-item>
          <a-form-item
              label='邮箱'
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
          >
            <a-input placeholder='请输入邮箱'
                     v-decorator="['email']"/>
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
import pinyin from '../../../utils/pinyin';

export default {
  name  : 'LocalContactDrawer',
  props : {
    type : { // add edit
      type    : String,
      default : 'add',
    },
  },
  data() {
    return {
      visible         : false,
      form            : this.$form.createForm(this),
      labelCol        : { span: 4 },
      wrapperCol      : { span: 20 },
      newLocalContact : {},
      editedContact   : {},
    };
  },
  computed : {
    drawerTitle() {
      return this.type === 'add' ? '添加联系人' : '编辑联系人';
    },
  },
  methods : {
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields(async(err, values) => {
        if (err) return;
        this.newLocalContact = values;
        this.newLocalContact.group = pinyin.convertToPinyin(values.name.slice(0, 1)).slice(0, 1).toUpperCase();
        this.newLocalContact.nick = /^(.*)\(.*\)$/.test(values.name) ? RegExp.$1.substr(-2, 2) : values.name.substr(-2, 2);
        if (this.type === 'add') {
          await this.$dispatch('storage.insertData', this.newLocalContact);
        }
        else {
          this.newLocalContact.id = this.editedContact.id;
          await this.$dispatch('storage.updateData', this.newLocalContact);
        }
        this.visible = false;
        this.$message.success('操作成功');
      });
    },
  },
  watch : {
    type(val) {
      if (val === 'add') {
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
      padding: 13px 24px;
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
    }

    .ant-form-item {
      margin-bottom: 12px;
    }
  }
</style>
