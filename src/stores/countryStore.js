import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const API_BASE_URL = 'http://localhost:8080'

async function requestJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export const useCountryStore = defineStore('country', () => {
  const countries = ref([])
  const loading = ref(false)
  const error = ref(null)

  const countryCount = computed(() => countries.value.length)

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

  async function fetchCountries() {
    return runWithLoading(async () => {
      countries.value = await requestJson(`${API_BASE_URL}/api/v1/countries`)
      return countries.value
    })
  }

  async function fetchCountryById(id) {
    return runWithLoading(() => requestJson(`${API_BASE_URL}/api/v1/countries/${id}`))
  }

  return {
    countries,
    loading,
    error,
    countryCount,
    fetchCountries,
    fetchCountryById,
  }
})
