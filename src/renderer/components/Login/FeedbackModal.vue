<template>
  <a-layout class="feedback-modal">
    <a-modal
        :title="$t('feedback.title')"
        v-model="visible"
        wrapClassName="feedback-modal"
        :okText="$t('feedback.submit')"
        :cancelText="$t('feedback.cancel')"
        @ok="submitFeedBack"
        @cancel="close"
        :okButtonProps="{props: {
          disabled : !problemDescribe,
          loading  : uploading,
        }}"
    >
      <div class="flex flex-col">
        <div>
          <div class="feedback-subtitle">{{$t('feedback.problemDescription')}}</div>
          <a-textarea
              maxlength="300"
              v-model="problemDescribe"
              :placeholder="$t('feedback.inputDescribe')"
              :autosize="{ minRows: 4, maxRows: 6 }"
          ></a-textarea>
        </div>
        <div class="mt-2 feedback-subtitle" v-if="useUploadImg">
          <div>{{$t('feedback.uploadImage')}}</div>
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
          <div class="feedback-subtitle">{{$t('feedback.contactWay')}}</div>
          <a-input
                  v-model="contactInfo"
                  :placeholder="$t('feedback.inputContactWay')"
          ></a-input>
        </div>
        <div class="mt-5 mb-12">
          <a-checkbox :checked="isUploadLog" @change="isUploadLog = !isUploadLog">
            {{$t('feedback.uploadLog')}}
          </a-checkbox>
        </div>
        <div class="feedback-contact mt-8">
          <div class="tel">
            {{$t('feedback.customService')}}
          </div>
          <div class="website mb-4">
            {{$t('feedback.officialWebsite')}}
          </div>
          <div class="support">
            {{$t('feedback.helpDescript')}}<a href="javascript:" @click="goHelp">{{$t('feedback.helpCenter')}}</a>
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
    goHelp() {
      this.$dispatch('application.openExternal', { path: 'http://support.yealink.com' });
    },
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
        this.$message.info(this.$t('feedback.inputDescribe'));

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
        this.$message.info(this.$t('feedback.uploadFailed'));
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
