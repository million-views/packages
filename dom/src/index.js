/// A simple DOM manipulation library in the style of jQuery

function dom(sel) {
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
      for (let i = 0, len = this.els.length; i < len; i++) {
        this.els[i].addEventListener(e, fn);
      }
      return this;
    },
    each(fn) {
      for (let i = 0, len = this.els.length; i < len; i++) {
        fn.call(this.els[i], i, this.els[i]);
      }
      return this;
    },
    addClass(c) {
      for (let i = 0, len = this.els.length; i < len; i++) {
        this.els[i].classList.add(c);
      }
      return this;
    },
    removeClass(c) {
      for (let i = 0, len = this.els.length; i < len; i++) {
        this.els[i].classList.remove(c);
      }
      return this;
    },
    toggleClass(c) {
      for (let i = 0, len = this.els.length; i < len; i++) {
        this.els[i].classList.toggle(c);
      }
      return this;
    },
    hasClass(c) {
      return this.els[0]?.classList.contains(c);
    },
    attr(n, v) {
      if (v === undefined) return this.els[0]?.getAttribute(n);
      for (let i = 0, len = this.els.length; i < len; i++) {
        this.els[i].setAttribute(n, v);
      }
      return this;
    },
    css(p, v) {
      for (let i = 0, len = this.els.length; i < len; i++) {
        this.els[i].style[p] = v;
      }
      return this;
    },
    find(s) {
      let res = [];
      for (let i = 0, len = this.els.length; i < len; i++) {
        const found = this.els[i].querySelectorAll(s);
        for (let j = 0, flen = found.length; j < flen; j++) {
          res.push(found[j]);
        }
      }
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
}

export default dom;
