import { useEffect, useState } from 'react'

const animateCount = (target, setter, duration = 1000) => {
  const startTime = performance.now()

  const step = now => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const value = Math.floor(progress * target)

    setter(value)

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

const useAnimatedCounterWithCache = (cacheKey, computeFn, dependencies = [], ttl = 10 * 60 * 1000) => {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey)
    const parsed = cached ? JSON.parse(cached) : null
    const now = Date.now()

    const computeAndAnimate = () => {
      const result = computeFn()
      const newCounts = {}

      Object.entries(result).forEach(([key, value]) => {
        animateCount(value, v => {
          newCounts[key] = v
          setCounts(prev => ({ ...prev, [key]: v }))
        })
      })

      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: result }))
    }

    if (parsed && now - parsed.timestamp < ttl) {
      Object.entries(parsed.data).forEach(([key, value]) => {
        animateCount(value, v => {
          setCounts(prev => ({ ...prev, [key]: v }))
        })
      })
    } else {
      computeAndAnimate()
    }
  }, dependencies)

  return counts
}

export default useAnimatedCounterWithCache
