import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

async function requestJson(url, options) {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
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
      conflicts.value = await requestJson('/api/v1/conflicts')
      return conflicts.value
    })
  }

  async function fetchConflictById(id) {
    return runWithLoading(async () => {
      currentConflict.value = await requestJson(`/api/v1/conflicts/${id}`)
      return currentConflict.value
    })
  }

  async function fetchConflictsByStatus(status) {
    return runWithLoading(async () => {
      const params = new URLSearchParams({ status })

      conflicts.value = await requestJson(`/api/v1/conflicts?${params}`)
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
  }
})
