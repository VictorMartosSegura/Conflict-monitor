import { storeToRefs } from 'pinia'

import { messages } from '../i18n/messages'
import { useUiStore } from '../stores/uiStore'

function getMessage(locale, key) {
  return key.split('.').reduce((value, segment) => value?.[segment], messages[locale])
}

export function useI18n() {
  const uiStore = useUiStore()
  const { locale } = storeToRefs(uiStore)

  function t(key) {
    return getMessage(locale.value, key) || getMessage('en', key) || key
  }

  return {
    locale,
    setLocale: uiStore.setLocale,
    t,
    toggleLocale: uiStore.toggleLocale,
  }
}
