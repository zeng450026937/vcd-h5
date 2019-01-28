import VcCalendar from 'ant-design-vue/es/vc-calendar';
import MonthCalendar from 'ant-design-vue/es/vc-calendar/src/MonthCalendar';
import RangePicker from 'ant-design-vue/es/date-picker/RangePicker';
import WeekPicker from 'ant-design-vue/es/date-picker/WeekPicker';
import { DatePickerProps, MonthPickerProps, WeekPickerProps, RangePickerProps } from 'ant-design-vue/es/date-picker/interface';
// import { CalendarProps } from 'ant-design-vue/es/calendar';
import createPicker from './utils/createPicker';
import wrapPicker from './utils/wrapPicker';


const DatePicker = wrapPicker(
  { ...createPicker(VcCalendar, DatePickerProps()), name: 'ADatePicker' },
  DatePickerProps(),
);

const MonthPicker = wrapPicker(
  { ...createPicker(MonthCalendar, MonthPickerProps()), name: 'AMonthPicker' },
  MonthPickerProps(),
  'YYYY-MM',
);

Object.assign(DatePicker, {
  RangePicker : wrapPicker(RangePicker, RangePickerProps()),
  MonthPicker,
  WeekPicker  : wrapPicker(WeekPicker, WeekPickerProps(), 'gggg-wo'),
});

/* istanbul ignore next */
DatePicker.install = function(Vue) {
  Vue.component(DatePicker.name, DatePicker);
  Vue.component(DatePicker.RangePicker.name, DatePicker.RangePicker);
  Vue.component(DatePicker.MonthPicker.name, DatePicker.MonthPicker);
  Vue.component(DatePicker.WeekPicker.name, DatePicker.WeekPicker);
};

export default DatePicker;
