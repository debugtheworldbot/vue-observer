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

const p = observable({ num: 0 });
const j = observe(() => console.log("this is observe", p.num));
p.num++;
