import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'conflict-monitor-locale'
const SUPPORTED_LOCALES = ['ca', 'en']

function getSavedLocale() {
  if (typeof localStorage === 'undefined') {
    return 'ca'
  }

  const savedLocale = localStorage.getItem(STORAGE_KEY)

  return SUPPORTED_LOCALES.includes(savedLocale) ? savedLocale : 'ca'
}

export const useUiStore = defineStore('ui', () => {
  const locale = ref(getSavedLocale())

  watch(locale, (newLocale) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale)
    }
  })

  function setLocale(newLocale) {
    if (SUPPORTED_LOCALES.includes(newLocale)) {
      locale.value = newLocale
    }
  }

  function toggleLocale() {
    locale.value = locale.value === 'ca' ? 'en' : 'ca'
  }

  return {
    locale,
    setLocale,
    toggleLocale,
  }
})
