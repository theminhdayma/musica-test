import { onMounted, onUnmounted } from 'vue'

let observer = null

function ensureObserver() {
  if (observer) return observer
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  return observer
}

function scan() {
  const o = ensureObserver()
  document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => o.observe(el))
}

export function useReveal() {
  let raf = null
  const trigger = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(scan)
  }

  onMounted(() => {
    trigger()
    // re-scan on route view changes
    const mo = new MutationObserver(trigger)
    mo.observe(document.body, { childList: true, subtree: true })
    onUnmounted(() => mo.disconnect())
  })

  return { rescan: trigger }
}
