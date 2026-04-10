<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import AppHeader from '../components/AppHeader.vue'
import { useI18n } from '../composables/useI18n'
import { useCountryStore } from '../stores/countryStore'

const { t } = useI18n()
const countryStore = useCountryStore()
const { countries, error, loading } = storeToRefs(countryStore)

const searchQuery = ref('')

const filteredCountries = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return countries.value
  }

  return countries.value.filter((country) => country.name?.toLowerCase().includes(query))
})

onMounted(async () => {
  try {
    await countryStore.fetchCountries()
  } catch {
    // The store exposes the failure through error for the template.
  }
})

function mapCode(code) {
  const flags = {
    UKR: 'ua',
    RUS: 'ru',
    USA: 'us',
    GBR: 'gb',
    FRA: 'fr',
    DEU: 'de',
    CHN: 'cn',
    ESP: 'es',
    ITA: 'it',
  }

  return flags[code] || 'un'
}
</script>

<template>
  <AppHeader />

  <main class="countries-page">
    <section class="page-heading">
      <p class="eyebrow">{{ t('countriesEyebrow') }}</p>
      <h1>{{ t('countries') }}</h1>
      <p class="page-summary">{{ t('countriesSubtitle') }}</p>
    </section>

    <section class="toolbar" aria-label="Country search">
      <label class="search-label">
        <span>{{ t('searchCountries') }}</span>
        <input v-model="searchQuery" type="search" :placeholder="t('searchCountries')" />
      </label>
    </section>

    <p v-if="loading" class="state-message">{{ t('loading') }}</p>
    <p v-else-if="error" class="state-message error-message">{{ t('error') }}: {{ error }}</p>

    <section v-else class="results-section" aria-label="Country results">
      <p class="results-count">{{ filteredCountries.length }} {{ t('countriesFound') }}</p>

      <p v-if="filteredCountries.length === 0" class="state-message">{{ t('noCountriesFound') }}</p>

      <div v-else class="countries-grid">
        <article v-for="country in filteredCountries" :key="country.id" class="country-card">
          <img
            :alt="`${country.name} flag`"
            :src="`https://flagcdn.com/48x36/${mapCode(country.code)}.png`"
            width="48"
            height="36"
          />

          <div class="country-info">
            <strong>{{ country.name }}</strong>
            <span class="code-badge">{{ country.code }}</span>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.countries-page {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: clamp(1.5rem, 5vw, 5rem);
}

.page-heading {
  max-width: 760px;
  margin-bottom: 2rem;
}

.eyebrow {
  margin-bottom: 0.75rem;
  color: #f59e0b;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  color: #ffffff;
  font-size: clamp(2rem, 6vw, 4.75rem);
  line-height: 1;
}

.page-summary {
  margin-top: 1rem;
  color: #cbd5e1;
  font-size: 1.05rem;
  line-height: 1.7;
}

.toolbar {
  margin-bottom: 2rem;
}

.search-label {
  display: grid;
  max-width: 420px;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 700;
}

.search-label input {
  width: 100%;
  padding: 0.9rem 1rem;
  color: #ffffff;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  outline: none;
}

.search-label input:focus-visible {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
}

.results-section {
  display: grid;
  gap: 1rem;
}

.results-count {
  color: #94a3b8;
  font-weight: 700;
}

.countries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.country-card,
.state-message {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
}

.country-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  transition:
    border-color 170ms ease,
    box-shadow 170ms ease,
    transform 170ms ease;
}

.country-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 16px 32px rgba(245, 158, 11, 0.14);
  transform: translateY(-2px);
}

.country-card img {
  flex: 0 0 auto;
  border: 1px solid #334155;
  object-fit: cover;
}

.country-info {
  display: grid;
  gap: 0.45rem;
}

.country-info strong {
  color: #ffffff;
  font-size: 1rem;
}

.code-badge {
  display: inline-flex;
  width: fit-content;
  padding: 0.25rem 0.55rem;
  color: #cbd5e1;
  background: #334155;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
}

.state-message {
  padding: 1.5rem;
  color: #cbd5e1;
  font-weight: 700;
}

.error-message {
  color: #fecaca;
  border-color: #dc2626;
}
</style>
