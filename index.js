const observable = (obj) => {
  const handler = {
    get: (target, key, receiver) => {
      const result = Reflect.get(target, key, receiver);
      track(target, key, receiver);
      return result;
    },
    set: (target, key, value, receiver) => {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key, value, receiver);
      return result;
    },
  };
  return new Proxy(obj, handler);
};

const targetMap = new WeakMap();
let activeEffect;
const activeEffectStack = [];
const track = (target, key, receiver) => {
  let depMap = targetMap.get(target);
  if (!depMap) {
    targetMap.set(target, (depMap = new Map()));
  }
  let dep = depMap.get(key);
  if (!dep) {
    depMap.set(key, (dep = new Set()));
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
};
const trigger = (target, key, value, receiver) => {
  const depMap = targetMap.get(target);
  if (!depMap) return;
  const dep = depMap.get(key);
  if (!dep) return;
  dep.forEach((item) => item && item());
};

const observe = (fn) => {
  try {
    activeEffect = fn;
    activeEffectStack.push(fn);
    return fn();
  } catch (e) {
    console.log(e);
  } finally {
    activeEffectStack.pop();
    activeEffect = activeEffectStack[activeEffectStack.length - 1];
  }
};

class computedIpl {
  #_value;
  #_setter;
  #effect;

  constructor(options) {
    this.#_value = undefined;
    this.#_setter = undefined;
    const { get, set } = options;
    this.#_setter = set;
    this.#effect = observe(() => {
      this.#_value = get();
    });
  }

  get value() {
    return this.#_value;
  }
  set value(val) {
    this.#_setter && this.#_setter(val);
  }
}
const computed = (fnOrOptions) => {
  const options = {
    get: null,
    set: null,
  };

  if (fnOrOptions instanceof Function) {
    options.get = fnOrOptions;
  } else {
    const { get, set } = fnOrOptions;
    options.get = get;
    options.set = set;
  }
  return new computedIpl(options);
};

let p = observable({ num: 0 });
let j = observe(() => {
  console.log("i am observe:", p.num);
  return `i am observe: ${p.num}`;
});
let e = observe(() => {
  console.log("i am observe2:", p.num);
});
let w = computed(() => {
  return "??????computed 1:" + p.num;
});
let v = computed({
  get: () => {
    return "test computed getter" + p.num;
  },

  set: (val) => {
    p.num = `test computed setter${val}`;
  },
});

p.num++;
console.log(w.value);
v.value = 3000;
console.log(w.value);
