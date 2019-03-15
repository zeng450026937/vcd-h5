import Quality from './Quality';

export default Quality.extend({
  mixins : [ Quality ],
  data() {
    return {
      kind        : 'video',
      aspectRatio : 16 / 9,
      frameRate   : 30,
      height      : 720,
      width       : 1280,
    };
  },
  computed : {
    id() {
      return this.width + this.height + this.frameRate;
    },
  },
  methods : {
    toObject() {
      return {
        aspectRatio : this.aspectRatio,
        frameRate   : this.frameRate,
        height      : this.height,
        width       : this.width,
      };
    },
  },
});
