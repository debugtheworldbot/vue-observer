const observable=(obj) =>{
    const handler = {
        get:(target,key,receiver)=>{
            const result = Reflect.get(target,key,receiver)
            track(target,key,receiver)
            return result
        },
        set:(target,key,value,receiver)=>{
            const result = Reflect.set(target,key,value,receiver)
            trigger(target,key,value,receiver)
            return result
        }
    }
    return new Proxy(obj,handler)
}

const targetMap  = new WeakMap()
let activeEffect
const track = (target,key,receiver)=>{
    const depMap = targetMap.get(target)
    if(!depMap){
        targetMap.set(target,depMap=new Map())
    }
    const dep = depMap.get(key)
    if(!dep){
        dep.set(key,dep=new Set())
    }
    if(!dep.has(activeEffect)){
        dep.add(activeEffect)
    }
}
const trigger = (target,key,value,receiver)=>{
    const depMap = targetMap.get(target)
    if(!depMap)return
    const dep = depMap.get(key)
    if(!dep)return
    dep.forEach(item=>item&&item())
}


