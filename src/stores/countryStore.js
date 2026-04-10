import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

async function requestJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export const useCountryStore = defineStore('country', () => {
  const countries = ref([])
  const currentCountry = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const countryCount = computed(() => countries.value.length)
  const countryCodes = computed(() => countries.value.map((country) => country.code))
  const countriesSortedByName = computed(() =>
    [...countries.value].sort((countryA, countryB) => countryA.name.localeCompare(countryB.name)),
  )

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
      countries.value = await requestJson('/api/v1/countries')
      return countries.value
    })
  }

  async function fetchCountryById(id) {
    return runWithLoading(async () => {
      currentCountry.value = await requestJson(`/api/v1/countries/${id}`)
      return currentCountry.value
    })
  }

  return {
    countries,
    currentCountry,
    loading,
    error,
    countryCount,
    countryCodes,
    countriesSortedByName,
    fetchCountries,
    fetchCountryById,
  }
})
