export default function throttle (func: (arg?: any) => void, limit: number) {
  let lastTime: number = 0
  return function(): any {
    let now: number = Date.now()
    if (now - lastTime >= limit) {
      func.apply(this, arguments)
      lastTime = now
    }
  }
}