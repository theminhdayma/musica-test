import { ref } from 'vue'

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export function useAsyncResource<T>(fn: () => Promise<T>) {
  const status = ref<AsyncStatus>('idle')
  const data = ref<T | null>(null)
  const error = ref<unknown>(null)

  async function run() {
    status.value = 'loading'
    error.value = null
    try {
      const result = await fn()
      data.value = result
      status.value = 'success'
      return result
    } catch (e) {
      error.value = e
      status.value = 'error'
      throw e
    }
  }

  return { status, data, error, run }
}

