import LocaleReceiver from 'ant-design-vue/es/locale-provider/LocaleReceiver';
import enUS from 'ant-design-vue/es/date-picker/locale/en_US';
import { getOptionProps, initDefaultProps } from 'ant-design-vue/es/_util/props-util';


export default function wrapPicker(Picker, props, defaultFormat) {
  return {
    name  : Picker.name,
    props : initDefaultProps(props, {
      format : defaultFormat || 'YYYY-MM-DD',
      locale : {},
    }),
    model : {
      prop  : 'value',
      event : 'change',
    },

    mounted() {
      const { autoFocus, disabled } = this;

      if (autoFocus && !disabled) {
        this.$nextTick(() => {
          this.focus();
        });
      }
    },

    methods : {
      getDefaultLocale() {
        const result = {
          ...enUS,
          ...this.locale,
        };

        result.lang = {
          ...result.lang,
          ...(this.locale || {}).lang,
        };

        return result;
      },
      handleSelect(value) {
        this.$emit('select', value);
      },
      onToday() {
        // this.$refs.picker.$refs.calendarInstance.onToday();
        this.$refs.picker.onToday();
      },
      setDate(date) {
        this.$refs.picker.$refs.calendar.setDate(date);
      },
      renderPicker(locale, localeCode) {
        const h = this.$createElement;

        return h(
          Picker,
          {
            ref   : 'picker',
            props : {
              ...getOptionProps(this),
              locale,
              localeCode,
            },
            scopedSlots : this.$scopedSlots || {},
            on          : {
              select : this.handleSelect,
            },
          },
          [ this.$slots && Object.keys(this.$slots).map((key) => h(
            'template',
            { slot: key, key },
            [ this.$slots[key] ]
          )) ]
        );
      },
    },

    render(h) {
      return h(LocaleReceiver, {
        attrs : {
          componentName : 'DatePicker',
          defaultLocale : this.getDefaultLocale,
        },
        scopedSlots : { default: this.renderPicker },
      });
    },
  };
}
