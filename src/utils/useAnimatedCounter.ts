// useAnimatedCounter.ts
import { useEffect, useState } from 'react'

export function useAnimatedCounter(target: number, duration = 500) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16) // ~60fps

    const animate = () => {
      start += increment

      if (start >= target) {
        setValue(target)

        return
      }

      setValue(Math.floor(start))
      requestAnimationFrame(animate)
    }

    animate()
  }, [target, duration])

  return value
}
