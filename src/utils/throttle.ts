export default function throttle (func: () => unknown, limit: number) {
  let inThrottle
  return function() {
    if (!inThrottle) {
      func.apply(this, arguments)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}