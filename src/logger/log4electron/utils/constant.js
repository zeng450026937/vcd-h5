export const styles = {
  // styles
  bold      : [ 1, 22 ],
  italic    : [ 3, 23 ],
  underline : [ 4, 24 ],
  inverse   : [ 7, 27 ],
  // grayscale
  white     : [ 37, 39 ],
  grey      : [ 90, 39 ],
  black     : [ 30, 39 ],
  // colors
  red       : [ 31, 39 ],
  green     : [ 32, 39 ],
  yellow    : [ 33, 39 ],
  orange    : [ 33, 39 ], // console 下 purple 显示为 cyan
  blue      : [ 34, 39 ],
  magenta   : [ 35, 39 ],
  cyan      : [ 36, 39 ],
  purple    : [ 36, 39 ], // console 下 purple 显示为 cyan
};

export const DEFAULT_LOG_LEVEL = {
  ALL   : { priority: Number.MIN_VALUE, color: 'grey' },
  TRACE : { priority: 5000, color: 'blue' },
  DEBUG : { priority: 10000, color: 'purple' },
  INFO  : { priority: 20000, color: 'green' },
  WARN  : { priority: 30000, color: 'orange' },
  ERROR : { priority: 40000, color: 'red' },
  FATAL : { priority: 50000, color: 'magenta' },
  MARK  : { priority: 9007199254740992, color: 'grey' }, // 2^53
  OFF   : { priority: Number.MAX_VALUE, color: 'grey' },
};

export const NAME = 'LOG_FOR_ELECTRON';
