let _offsetBottom = 0;
let _target = window;

function isAndroid() {
  const { userAgent } = window.navigator;
  const agent = userAgent.toLowerCase();
  return agent.indexOf('android') > -1 || agent.indexOf('adr') > -1;
}

function getBoundingClientRect(element) {
  if (!element) {
    return null;
  }
  if (!element.getClientRects().length) {
    return null;
  }

  return element.getBoundingClientRect();
}

/**
 *
 * @param {*} t timestamp: 当前时间 - 动画最开始执行的那一刻
 * @param {*} b 开始状态
 * @param {*} c 结束状态
 * @param {*} d duration: 期待动画持续的时间
 */
function easeInOutCubic(t, b, c, d = 450) {
  const cc = c - b;

  t /= d / 2;
  if (t < 1) {
    return cc / 2 * t * t * t + b;
  }

  // eslint-disable-next-line
  return cc / 2 * ((t -= 2) * t * t + 2) + b;
}

function getRequestAnimationFrame() {
  return window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame;
}

// 获取window的偏移量, 或者元素的scroll偏移量
function getScroll(target = window, isTop = true) {
  if (typeof window === 'undefined') {
    return 0;
  }

  const prop = isTop ? 'pageYOffset' : 'pageXOffset';
  const method = isTop ? 'scrollTop' : 'scrollLeft';
  const isWindow = target === window;

  const ret = isWindow ? target[prop] : target[method];

  return ret;
}

function isNumber(num) {
  return typeof num === 'number' && !Number.isNaN(num);
}

function scrollTo(target, originScrollTop, targetScrollTop) {
  if (!target) return;
  if (!isNumber(originScrollTop) || !isNumber(targetScrollTop)) return;

  const reqAnimFrame = getRequestAnimationFrame();

    let start = null;
    // 该函数的参数: 现在距离最开始触发requestAnimationFrame callback的时间间隔, 但是它的值不为0
    const frameFunc = (timestamp) => {
      if (!start) {
        start = timestamp;
      }
      const realTimestamp = timestamp - start;// 当前时间
      const isWindow = target === window;

      if (isWindow) {
        window.scrollTo(
          window.pageXOffset,
          easeInOutCubic(realTimestamp, originScrollTop, targetScrollTop, 200),
        );
      } else {
        target.scrollTop = easeInOutCubic(realTimestamp, originScrollTop, targetScrollTop, 200);
      }

      if (realTimestamp < 200) {
        reqAnimFrame(frameFunc);
      }
    };

    reqAnimFrame(frameFunc);
}

let prevBodyHeight;
let originScrollTop;
let hasBubbleInput = false;// 代表是否调整过input位置
/**
 * target: 外部容器, 默认window
 * offsetBottom: 默认input或者textarea会移动到页面可视区域底部
 *************** 但如果页面中还有fixed button的情况下, 可用此参数调整输入框位置
 */
function bubbleInputIfNeeded() {
  const target = _target;
  const offsetBottom = _offsetBottom;

  /**
   * 此时说明是收起键盘的状态
   * 为了兼容部分机型键盘收起后, 页面无法恢复到键盘弹起前的状态, 所以需要添加fix, 手动将页面滚动至键盘弹起前的状态
   * 目前发现的机型有: 小米9 Android9
   */
  if (hasBubbleInput && prevBodyHeight && document.body.clientHeight && document.body.clientHeight > prevBodyHeight) {
    const curScrollTop = getScroll(target);
    scrollTo(target, curScrollTop, originScrollTop);

    // 重置hasBubbleInput 和 prevBodyHeight
    hasBubbleInput = false;
    prevBodyHeight = undefined;
    originScrollTop = undefined;
  }

  // 获取文档当前聚焦的元素
  const { activeElement } = document;

  if (!['INPUT', 'TEXTAREA'].includes(activeElement.tagName.toUpperCase())) return;
  const rect = getBoundingClientRect(activeElement);

  if (!rect) return;

  // 判断当前focus的input底部是否在document.body可视区域内
  if (rect.bottom > document.body.clientHeight - offsetBottom) {
    prevBodyHeight = document.body.clientHeight;

    // window或者父元素已经滚动的距离
    originScrollTop = getScroll(target);

    /** 
     * 元素需要滚动的距离
     * ps: 在安卓手机上, 键盘弹起的时候, document.body的高度会减小为可视区域的高度
    */
    const elementNeedScroll = rect.bottom - document.body.clientHeight + offsetBottom;
    const targetScrollTop = originScrollTop + elementNeedScroll;

    /**
     * 设置hasBubbleInput, 代表目前是调整过input位置的状态, 所以当键盘收起的时候, 需要将target恢复至原先状态
     * 主要是因为部分安卓机在键盘收起后, 页面无法恢复
     */
    hasBubbleInput = true;
    scrollTo(target, originScrollTop, targetScrollTop);
  }
}

let eventListener;

function work() {
  if (typeof window === 'undefined') return;

  if (isAndroid()) {
    window.addEventListener('resize', eventListener = bubbleInputIfNeeded.bind(this));
  }
}

const BubbleInput = {
  setOffsetBottom(offsetBottom) {
    _offsetBottom = offsetBottom;
    return this;
  },
  setTarget(target) {
    _target = target;
    return this;
  },
  reset() {
    this.setOffsetBottom(0);
    this.setTarget(window);
    return this;
  },
  work,
  offWork() {
    this.reset();
    window.removeEventListener('resize', eventListener);
  },
};

let _instance = null;

function createBubbleInput() {
  if (!_instance) {
    _instance = BubbleInput;
  }

  return _instance;
}

export default createBubbleInput();
