<script setup>
import { computed } from 'vue'

import { useI18n } from '../composables/useI18n'

const { currentLang, setLang, t } = useI18n()

const nextLang = computed(() => (currentLang.value === 'en' ? 'ca' : 'en'))

function toggleLanguage() {
  setLang(nextLang.value)
}
</script>

<template>
  <header class="app-header">
    <RouterLink class="app-title" to="/">Global Conflict Monitor</RouterLink>

    <div class="header-actions">
      <nav class="app-nav" aria-label="Primary navigation">
        <RouterLink to="/">{{ t('home') }}</RouterLink>
        <RouterLink to="/conflicts">{{ t('conflicts') }}</RouterLink>
        <RouterLink to="/countries">{{ t('countries') }}</RouterLink>
      </nav>

      <button class="lang-button" type="button" @click="toggleLanguage">
        {{ currentLang.toUpperCase() }} / {{ nextLang.toUpperCase() }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem clamp(1rem, 4vw, 4rem);
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.app-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
  border-radius: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 1rem;
}

.app-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 1rem;
}

.app-nav a,
.lang-button {
  color: #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  transition:
    color 160ms ease,
    background 160ms ease;
}

.app-nav a:hover,
.app-nav a.router-link-exact-active,
.lang-button:hover {
  color: #f59e0b;
}

.lang-button {
  padding: 0.45rem 0.75rem;
  background: transparent;
  border: 1px solid #334155;
  cursor: pointer;
}

.app-title:focus-visible,
.app-nav a:focus-visible,
.lang-button:focus-visible {
  outline: 3px solid rgba(245, 158, 11, 0.45);
  outline-offset: 4px;
}

@media (max-width: 640px) {
  .app-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions,
  .app-nav {
    justify-content: flex-start;
  }
}
</style>
