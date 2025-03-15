/// A simple DOM manipulation library in the style of jQuery

const dom = (sel) => {
  let els;
  if (sel === window || sel === document) {
    els = [sel];
  } else if (typeof sel === "string") {
    els = document.querySelectorAll(sel);
  } else if (sel instanceof Node) {
    els = [sel];
  } else if (sel instanceof NodeList || Array.isArray(sel)) {
    els = sel;
  } else {
    els = [];
  }

  return {
    els,
    on(e, fn) {
      this.els.forEach((el) => el.addEventListener(e, fn));
      return this;
    },
    each(fn) {
      this.els.forEach((el, i) => fn.call(el, i, el));
      return this;
    },
    addClass(c) {
      this.els.forEach((el) => el.classList.add(c));
      return this;
    },
    removeClass(c) {
      this.els.forEach((el) => el.classList.remove(c));
      return this;
    },
    attr(n, v) {
      if (v === undefined) return this.els[0]?.getAttribute(n);
      this.els.forEach((el) => el.setAttribute(n, v));
      return this;
    },
    css(p, v) {
      this.els.forEach((el) => el.style[p] = v);
      return this;
    },
    find(s) {
      let res = [];
      this.els.forEach((el) => res = res.concat([...el.querySelectorAll(s)]));
      return dom(res);
    },
    closest(s) {
      return dom(this.els[0]?.closest(s));
    },
    next() {
      return dom(this.els[0]?.nextElementSibling);
    },
    parent() {
      return dom(this.els[0]?.parentNode);
    },
  };
};

export default dom;
