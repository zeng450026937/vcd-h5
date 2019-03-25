<template>
  <div id="draggable-element"
       ref="draggableElement">
    <slot name="content"/>
  </div>
</template>

<script>
export default {
  name  : 'DraggableElement',
  props : {
    parentId : {
      type    : String,
      default : '',
    },
    place : { // start end
      type    : String,
      default : 'start',
    },
  },
  data() {
    const ops = {
      direction : 'all',
      handler   : false,
    };


    return {
      selfElement      : null,
      parentElement    : null,
      x                : 0, // 元素左上角的坐标
      y                : 0,
      X                : 0, // 记录点击的坐标
      Y                : 0,
      moveX            : 0, // 移动的距离
      moveY            : 0,
      boxWidth         : 0, // 可移动区域的大小
      boxHeight        : 0,
      sonWidth         : 0, // 移动元素的大小
      sonHeight        : 0,
      isDown           : false, // 鼠标是否按下
      hasDocumentEvent : false, // 是否添加document事件
      ...ops,
    };
  },
  async mounted() {
    await this.$nextTick();
    this.selfElement = this.$refs.draggableElement;
    this.parentElement = document.getElementById(this.parentId);
    this.parentElement.style.position = 'relative';
    this.init();
  },
  computed : {
  },
  methods : {
    init() {
      this.selfElement.childNodes.forEach((child) => {
        if (child.tagName.toUpperCase() === 'IMG') {
          child.onmousedown = (e) => {
            e.stopPropagation();
          };
        }
      });
      this.initSize();
      this.initPosition();
      this.selfElement.addEventListener('mousedown', this.onHandlerMouseDown);
    },
    initPosition() {
      if (this.place === 'end') { // 初始化位置
        this.selfElement.style.left = `${this.boxWidth - this.sonWidth}px`;
      }
    },
    initSize() {
      this.boxWidth = this.parentElement.offsetWidth;
      this.boxHeight = this.parentElement.offsetHeight;
      this.sonWidth = this.selfElement.offsetWidth;
      this.sonHeight = this.selfElement.offsetHeight;
    },
    updatePosition() { // for outer
      this.initSize();
      const left = parseInt(this.selfElement.style.left.split('px')[0], 10);
      const top = parseInt(this.selfElement.style.top.split('px')[0], 10);

      if (left > this.boxWidth - this.sonWidth) {
        this.selfElement.style.left = `${this.boxWidth - this.sonWidth}px`;
      }
      else if (left < 0) {
        this.selfElement.style.left = '0px';
      }
      else if (top > this.boxHeight - this.sonHeight) {
        this.selfElement.style.top = `${this.boxHeight - this.sonHeight}px`;
      }
      else if (top < 0) {
        this.selfElement.style.top = '0px';
      }
    },
    onHandlerMouseDown(e) {
      if (!this.hasDocumentEvent) {
        this.initSize();
        document.addEventListener('mouseup', this.onDocumentMouseUp);
        document.addEventListener('mousemove', this.onDocumentMouseMove);
        this.hasDocumentEvent = true;
      }
      this.isDown = true;
      this.X = e.pageX;
      this.Y = e.pageY;
      this.x = this.selfElement.offsetLeft;
      this.y = this.selfElement.offsetTop;
      this.selfElement.className = `${this.selfElement.className} on`;
      this.dragStart(parseInt(this.selfElement.style.left.split('px')[0], 10), parseInt(this.selfElement.style.top.split('px')[0], 10));

      return false;
    },
    onDocumentMouseMove(e) {
      this.moveX = this.x + e.pageX - this.X;
      this.moveY = this.y + e.pageY - this.Y;
      if (this.isDown) {
        this.dragMove(parseInt(this.selfElement.style.left.split('px')[0], 10), parseInt(this.selfElement.style.top.split('px')[0], 10));
      }
      else {
        return false;
      }
      if (this.direction.toLowerCase() === 'x') {
        this.thisXMove();
      }
      else if (this.direction.toLowerCase() === 'y') {
        this.thisYMove();
      }
      else {
        this.thisAllMove();
      }
    },
    onDocumentMouseUp(e) {
      this.dragEnd(parseInt(this.selfElement.style.left.split('px')[0], 10),
        parseInt(this.selfElement.style.top.split('px')[0], 10));
      const classList = this.selfElement.className.trim().split(' ');
      const index = classList.findIndex((c) => c === 'on');

      if (index > -1) {
        classList.splice(index, 1);
      }
      this.selfElement.className = classList.join(' ');
      this.isDown = false;
      if (this.hasDocumentEvent) {
        document.removeEventListener('mouseup', this.onDocumentMouseUp);
        document.removeEventListener('mousemove', this.onDocumentMouseMove);
        this.hasDocumentEvent = false;
      }
    },
    thisAllMove() { // 全部移动
      if (this.isDown === true) {
        this.selfElement.style.left = `${this.moveX}px`;
        this.selfElement.style.top = `${this.moveY}px`;
      }
      else {
        return;
      }
      if (this.moveX < 0) {
        this.selfElement.style.left = '0px';
      }
      if (this.moveX > (this.boxWidth - this.sonWidth)) {
        this.selfElement.style.left = `${this.boxWidth - this.sonWidth}px`;
      }
      if (this.moveY < 0) {
        this.selfElement.style.top = '0px';
      }
      if (this.moveY > (this.boxHeight - this.sonHeight)) {
        this.selfElement.style.top = `${this.boxHeight - this.sonHeight}px`;
      }
    },
    thisXMove() { // x轴移动
      if (this.isDown === true) {
        this.selfElement.style.left = `${this.moveX} px`;
      }
      else {
        return;
      }
      if (this.moveX < 0) {
        this.selfElement.style.left = '0px';
      }
      if (this.moveX > (this.boxWidth - this.sonWidth)) {
        this.selfElement.style.left = `${this.boxWidth - this.sonWidth}px`;
      }
    },
    thisYMove() { // y轴移动
      if (this.isDown === true) {
        this.selfElement.style.top = `${this.moveY}px`;
      }
      else {
        return;
      }
      if (this.moveY < 0) {
        this.selfElement.style.top = '0px';
      }
      if (this.moveY > (this.boxHeight - this.sonHeight)) {
        this.selfElement.style.top = `${this.boxHeight - this.sonHeight}px`;
      }
    },
    dragStart(x, y) {
      this.$emit('dragStart', { x, y });
    },
    dragEnd(x, y) {
      this.$emit('dragEnd', { x, y });
    },
    dragMove(x, y) {
      this.$emit('dragMove', { x, y });
    },
  },
};
</script>

<style scoped lang="less">
  #draggable-element {
    position: absolute;
    cursor: move;
  }

</style>
