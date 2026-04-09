<script setup>
import { useI18n } from '../composables/useI18n'

const { locale, setLocale, t } = useI18n()
</script>

<template>
  <header class="app-header">
    <RouterLink class="app-title" to="/">Global Conflict Monitor</RouterLink>

    <div class="header-actions">
      <nav class="app-nav" aria-label="Primary navigation">
        <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/conflicts">{{ t('nav.conflicts') }}</RouterLink>
        <RouterLink to="/countries">{{ t('nav.countries') }}</RouterLink>
      </nav>

      <div class="locale-switcher" aria-label="Language selector">
        <button
          type="button"
          :class="{ 'locale-active': locale === 'ca' }"
          @click="setLocale('ca')"
        >
          CA
        </button>
        <span>|</span>
        <button
          type="button"
          :class="{ 'locale-active': locale === 'en' }"
          @click="setLocale('en')"
        >
          EN
        </button>
      </div>
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
  justify-content: flex-end;
  gap: 0.35rem 1rem;
}

.app-nav a {
  color: #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  transition:
    color 160ms ease,
    box-shadow 160ms ease;
}

.app-nav a:hover,
.app-nav a.router-link-exact-active {
  color: #f59e0b;
}

.locale-switcher {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 900;
}

.locale-switcher button {
  padding: 0.3rem;
  color: #cbd5e1;
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 900;
  transition: color 160ms ease;
}

.locale-switcher button:hover,
.locale-switcher .locale-active {
  color: #f59e0b;
}

.app-title:focus-visible,
.app-nav a:focus-visible,
.locale-switcher button:focus-visible {
  outline: 3px solid rgba(245, 158, 11, 0.45);
  outline-offset: 4px;
}

@media (max-width: 640px) {
  .app-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .app-nav,
  .header-actions {
    justify-content: flex-start;
  }
}
</style>
