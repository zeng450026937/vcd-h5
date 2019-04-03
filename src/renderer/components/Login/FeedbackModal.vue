<template>
  <a-layout class="feedback-modal">
    <a-modal
        title="意见反馈"
        v-model="visible"
        wrapClassName="feedback-modal"
        okText="提交"
        cancelText="取消"
        @ok="submitFeedBack"
        @cancel="close"
        :okButtonProps="{props: {
          disabled : !problemDescribe,
          loading  : uploading,
        }}"
    >
      <div class="flex flex-col">
        <div>
          <div class="feedback-subtitle">问题描述 （必填）</div>
          <a-textarea
              v-model="problemDescribe"
              placeholder="请输入详细的问题描述"
              :autosize="{ minRows: 4, maxRows: 6 }"
          ></a-textarea>
        </div>
        <div class="mt-2 feedback-subtitle" v-if="useUploadImg">
          <div>上传图片（可选）</div>
        </div>
        <div class="mt-1" v-if="useUploadImg">
          <a-upload
              :beforeUpload="stopAutoUpload"
              listType="picture-card"
              :fileList="fileList"
              @preview="handlePreview"
              @change="handleChange"
          >
            <div v-if="fileList.length < 3">
              <a-icon type="plus" class="text-2xl" />
              <div class="ant-upload-text">Upload</div>
            </div>
          </a-upload>
        </div>
        <!--<div class="mt-2">-->
          <!--<span>联系方式</span>-->
          <!--<a-input placeholder="请输入联系方式"/>-->
        <!--</div>-->
        <div>
          <div class="feedback-subtitle">联系方式 （选填）</div>
          <a-input
                  v-model="contactInfo"
                  placeholder="请输入联系方式"
          ></a-input>
        </div>
        <div class="mt-5 mb-12">
          <a-checkbox :checked="isUploadLog" @change="isUploadLog = !isUploadLog">上传错误日志，帮助我们更好的定位错误</a-checkbox>
        </div>
        <div class="feedback-contact mt-8">
          <div class="tel">
            电话客服：0592-570-2000
          </div>
          <div class="website mb-4">
            官方网站：www.yealink.com.cn
          </div>
          <div class="support">
            如需技术支持，请访问<a href="javascript:">帮助中心</a>
          </div>
        </div>
      </div>
    </a-modal>
  </a-layout>
</template>

<script>
import { readFile } from 'fs-extra';
import path from 'path';
import { getDate } from '../../utils/date';

export default {
  name : 'FeedbackModal',
  data() {
    return {
      visible         : false,
      previewVisible  : false,
      previewImage    : '',
      fileList        : [],
      isUploadLog     : true,
      problemDescribe : '',
      useUploadImg    : false,
      contactInfo     : '',
      uploading       : false,
    };
  },
  methods : {
    handleOk() {},
    close() {
      this.reset();
      this.previewVisible = false;
    },
    stopAutoUpload() {
      return false;
    },
    handlePreview(file) {
      this.previewImage = file.url || file.thumbUrl;
      this.previewVisible = true;
    },
    handleChange({ fileList }) {
      this.fileList = fileList;
    },
    check() {
      if (!this.problemDescribe) {
        this.$message.info('请输入问题描述！');

        return false;
      }

      return true;
    },
    async getTodayLog() {
      const logDir = await ipcProxy.getLogDirectoryPath();
      const fileName = this.getLogFileName();
      const input = await readFile(path.join(logDir, `/${fileName}`));

      return input;
    },
    getLogFileName() {
      return `vc-desktop.${getDate()}.log`;
    },
    reset() {
      this.fileList = [];
      this.problemDescribe = '';
      this.contactInfo = '';
      this.isUploadLog = true;
    },
    async submitFeedBack() {
      if (!this.check()) return;

      if (this.uploading) return;

      this.uploading = true;
      const formdata = new FormData();

      if (this.isUploadLog) {
        const todayLog = await this.getTodayLog();
        const content = todayLog.toString();
        const filename = this.getLogFileName();
        const blob = new Blob([ content ], { type: 'text/plain' });

        formdata.append('log', blob, filename);
      }

      if (this.useUploadImg) {
        this.fileList.map((item) => item.originFileObj).forEach((img) => {
          formdata.append('img', img);
        });
      }

      formdata.append('param', JSON.stringify({
        feedbackContent : this.problemDescribe,
        contactInfo     : this.contactInfo,
        // feedbackCategory,
        // feedbackTitle,
      }));

      try {
        await this.$dispatch('ytms.doFeedback', { formdata });
        this.visible = false;
        this.uploading = false;
        this.close();
      }
      catch (error) {
        this.$message.info('上报反馈信息失败！');
        this.uploading = false;
      }
    },
  },
};
</script>

<style lang="less">
.feedback-modal {
  display: flex;
  align-items: center;
  .ant-modal-header {
    text-align: center;
  }
  .feedback-subtitle{
    height: 36px;
    line-height: 36px;
  }
  .ant-modal-close-x {
    line-height: 45px;
  }
  .ant-modal {
    top: 0 !important;
  }
  .ant-modal-header {
    padding: 12px 16px;
  }
  .ant-modal-body {
    padding:10px 30px 20px 30px;
  }
  .ant-modal-footer {
    padding: 10px 16px;
    text-align: center;
  }
  .feedback-contact {
    font-size: 12px;
  }
}
</style>
