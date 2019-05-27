<template>
  <div class="avatar-subject-content">
    <ContactPopover  @call="handleCall" :info="info" :contact="contact"></ContactPopover>
    <div class="subject">{{ {contact, info} | recordName}}</div>
  </div>
</template>

<script>
import ContactPopover from './ContactPopover.vue';
import { $t } from '../../../i18n';

export default {
  name  : 'ContactPopoverAndSub',
  props : {
    info : {
      type : Object,
      default() {
        return {};
      },
    },
    pin : {
      type : String,
      default() {
        return null;
      },
    },
  },
  components : {
    ContactPopover,
  },
  data() {
    return {
      contact : {},
    };
  },
  filters : {
    recordName({ contact, info }) {
      if (info.isConference) {
        if (!info.subject) return $t('contact.label.unknown');

        return info.subject;
      }

      if (!contact) return '';

      return contact.name;
    },
  },
  computed : {
    store() {
      return this.$model.contact.phoneBookStore;
    },
    loadMode() {
      return this.$model.contact.loadMode;
    },
  },
  methods : {
    handleCall(data) {
      this.$emit('call', data);
    },
    async getContactInfo(val) {
      let contact = this.store.getNodeByNumber(val);

      if (!contact) {
        if (this.loadMode === 'SPLIT' && !this.$model.login.sketch.isCloud) {
          const contacts = await this.$model.contact.findContacts(val).catch(() => Promise.resolve(null));

          contact = contacts.find((n) => n.number === val);
        }

        if (contact) {
          const parentNode = this.store.findParentNode(contact.id, contact.parentId);

          contact.parentNode = parentNode.name;
        }
      }

      if (!contact) {
        contact = await this.$model.contact.local.search(val);
        if (contact) contact.isLocal = true;
      }

      if (!contact) {
        contact = { number: val, name: $t('contact.label.unknown'), unknown: true };
      }

      return this.contact = contact;
    },
  },
  created() {
    this.getContactInfo(this.info.otherId);
  },
};
</script>

<style scoped lang="less">
  .avatar-subject-content {
    display: flex;
    align-items: center;
    width: 100%;
    .subject {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex-grow: 1;
      padding-left: 10px;
    }
  }
</style>
