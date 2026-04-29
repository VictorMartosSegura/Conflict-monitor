import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const API_URL = import.meta.env.VITE_API_URL || ''

function buildApiUrl(path) {
  return `${API_URL}${path}`
}

function isSpringErrorPayload(data) {
  return (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    ('timestamp' in data || 'error' in data || 'status' in data || 'path' in data)
  )
}

async function requestJson(path, options) {
  const response = await fetch(buildApiUrl(path), options)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) {
    return null
  }

  const data = await response.json()

  if (isSpringErrorPayload(data)) {
    throw new Error(data.error || `Request failed with status ${data.status}`)
  }

  return data
}

export const useConflictStore = defineStore('conflict', () => {
  const conflicts = ref([])
  const currentConflict = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const activeConflicts = computed(() =>
    conflicts.value.filter((conflict) => conflict.status === 'ACTIVE'),
  )
  const frozenConflicts = computed(() =>
    conflicts.value.filter((conflict) => conflict.status === 'FROZEN'),
  )
  const endedConflicts = computed(() =>
    conflicts.value.filter((conflict) => conflict.status === 'ENDED'),
  )
  const conflictCount = computed(() => conflicts.value.length)

  async function runWithLoading(action) {
    loading.value = true
    error.value = null

    try {
      return await action()
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Unexpected request error'
      throw caughtError
    } finally {
      loading.value = false
    }
  }

  async function fetchConflicts() {
    return runWithLoading(async () => {
      const data = await requestJson('/api/v1/conflicts')

      if (!Array.isArray(data)) {
        throw new Error('Invalid conflicts response')
      }

      conflicts.value = data
      return conflicts.value
    })
  }

  async function fetchConflictById(id) {
    return runWithLoading(async () => {
      const data = await requestJson(`/api/v1/conflicts/${id}`)

      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Invalid conflict response')
      }

      currentConflict.value = data
      return currentConflict.value
    })
  }

  async function fetchConflictsByStatus(status) {
    return runWithLoading(async () => {
      const data = await requestJson(`/api/v1/conflicts?status=${status}`)

      if (!Array.isArray(data)) {
        throw new Error('Invalid conflicts response')
      }

      conflicts.value = data
      return conflicts.value
    })
  }

  async function createConflict(data) {
    return runWithLoading(async () => {
      const conflict = await requestJson('/api/v1/conflicts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!conflict || typeof conflict !== 'object' || Array.isArray(conflict)) {
        throw new Error('Invalid conflict response')
      }

      conflicts.value.push(conflict)
      return conflict
    })
  }

  async function deleteConflict(id) {
    return runWithLoading(async () => {
      await requestJson(`/api/v1/conflicts/${id}`, {
        method: 'DELETE',
      })

      conflicts.value = conflicts.value.filter((conflict) => conflict.id !== id)

      if (currentConflict.value?.id === id) {
        currentConflict.value = null
      }
    })
  }

  async function updateConflict(id, data) {
    return runWithLoading(async () => {
      const updatedConflict = await requestJson(`/api/v1/conflicts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!updatedConflict || typeof updatedConflict !== 'object' || Array.isArray(updatedConflict)) {
        throw new Error('Invalid conflict response')
      }

      conflicts.value = conflicts.value.map((conflict) =>
        conflict.id === id ? updatedConflict : conflict,
      )

      if (currentConflict.value?.id === id) {
        currentConflict.value = updatedConflict
      }

      return updatedConflict
    })
  }

  return {
    conflicts,
    currentConflict,
    loading,
    error,
    activeConflicts,
    frozenConflicts,
    endedConflicts,
    conflictCount,
    fetchConflicts,
    fetchConflictById,
    fetchConflictsByStatus,
    createConflict,
    deleteConflict,
    updateConflict,
  }
})
