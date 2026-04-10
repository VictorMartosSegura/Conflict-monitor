<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRouter } from 'vue-router'

import AppHeader from '../components/AppHeader.vue'
import ConflictCard from '../components/ConflictCard.vue'
import ConflictChart from '../components/ConflictChart.vue'
import StatCard from '../components/StatCard.vue'
import { useI18n } from '../composables/useI18n'
import { useConflictStore } from '../stores/conflictStore'
import { useCountryStore } from '../stores/countryStore'

const router = useRouter()
const { t } = useI18n()
const conflictStore = useConflictStore()
const countryStore = useCountryStore()

const {
  activeConflicts,
  conflictCount,
  error: conflictError,
  frozenConflicts,
  loading: conflictsLoading,
} = storeToRefs(conflictStore)
const {
  countryCount,
  error: countryError,
  loading: countriesLoading,
} = storeToRefs(countryStore)

const pageLoading = ref(false)

const recentActiveConflicts = computed(() => activeConflicts.value.slice(0, 3))
const pageError = computed(() => conflictError.value || countryError.value)
const isLoading = computed(() => pageLoading.value || conflictsLoading.value || countriesLoading.value)

onMounted(async () => {
  pageLoading.value = true

  try {
    await conflictStore.fetchConflicts()
  } catch {
    // The store exposes the failure through conflictError.
  }

  try {
    await countryStore.fetchCountries()
  } catch {
    // The store exposes the failure through countryError.
  } finally {
    pageLoading.value = false
  }
})

function goToConflict(id) {
  router.push(`/conflicts/${id}`)
}
</script>

<template>
  <AppHeader />

  <main class="home-page">
    <section class="hero-banner">
      <div class="hero-content">
        <h1>{{ t('heroTitle') }}</h1>
        <p>{{ t('heroSubtitle') }}</p>
        <RouterLink class="hero-link" to="/conflicts">{{ t('viewAllConflicts') }}</RouterLink>
      </div>
    </section>

    <p v-if="isLoading" class="state-message">{{ t('loading') }}</p>
    <p v-else-if="pageError" class="state-message error-message">{{ t('error') }}: {{ pageError }}</p>

    <template v-else>
      <section class="stats-grid" aria-label="Dashboard statistics">
        <StatCard :title="t('totalConflicts')" :value="conflictCount" icon="⚔️" color="#f59e0b" />
        <StatCard :title="t('activeNow')" :value="activeConflicts.length" icon="🔴" color="#dc2626" />
        <StatCard :title="t('frozen')" :value="frozenConflicts.length" icon="🔵" color="#2563eb" />
        <StatCard :title="t('countriesCount')" :value="countryCount" icon="🌐" color="#16a34a" />
      </section>

      <ConflictChart
        class="chart-section"
        :active="activeConflicts.length"
        :frozen="frozenConflicts.length"
        :ended="conflictCount - activeConflicts.length - frozenConflicts.length"
      />

      <section class="recent-section">
        <div class="section-heading">
          <h2>{{ t('recentActive') }}</h2>
          <p>{{ t('recentSummary') }}</p>
        </div>

        <p v-if="recentActiveConflicts.length === 0" class="state-message empty-message">
          {{ t('noActiveConflicts') }}
        </p>

        <div v-else class="conflicts-grid">
          <ConflictCard
            v-for="conflict in recentActiveConflicts"
            :key="conflict.id"
            :conflict="conflict"
            @select="goToConflict"
          />
        </div>

        <RouterLink class="section-link" to="/conflicts">{{ t('seeAll') }}</RouterLink>
      </section>

      <section class="about-section">
        <div class="about-copy">
          <h2>{{ t('aboutTitle') }}</h2>
          <p>{{ t('aboutText') }}</p>
        </div>

        <div class="feature-row">
          <article class="feature-item">
            <span>📊</span>
            <strong>{{ t('statistics') }}</strong>
          </article>
          <article class="feature-item">
            <span>🗺️</span>
            <strong>{{ t('details') }}</strong>
          </article>
          <article class="feature-item">
            <span>🔍</span>
            <strong>{{ t('searchFilter') }}</strong>
          </article>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.home-page {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 4rem);
}

.hero-banner {
  margin-bottom: 2rem;
  padding: 4rem 1.5rem;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 1px solid #334155;
  border-radius: 8px;
  text-align: center;
}

.hero-content {
  width: min(100%, 760px);
  margin: 0 auto;
}

h1 {
  color: #ffffff;
  font-size: clamp(2.3rem, 7vw, 5rem);
  line-height: 1.05;
}

.hero-content p {
  margin: 1rem auto 1.5rem;
  color: #cbd5e1;
  font-size: 1.1rem;
  line-height: 1.7;
}

.hero-link,
.section-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem 1.2rem;
  color: #0f172a;
  background: #f59e0b;
  border-radius: 8px;
  font-weight: 800;
  transition:
    background 170ms ease,
    box-shadow 170ms ease,
    transform 170ms ease;
}

.hero-link:hover,
.section-link:hover {
  background: #fbbf24;
  transform: translateY(-1px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.chart-section {
  margin-bottom: 2rem;
}

.recent-section,
.about-section,
.state-message {
  padding: clamp(1.25rem, 3vw, 2rem);
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
}

.recent-section {
  display: grid;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.section-heading {
  display: grid;
  gap: 0.5rem;
}

h2 {
  color: #ffffff;
  font-size: clamp(1.5rem, 4vw, 2.4rem);
  line-height: 1.1;
}

.section-heading p,
.about-copy p,
.empty-message {
  color: #cbd5e1;
  line-height: 1.7;
}

.conflicts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.section-link {
  justify-self: start;
}

.about-section {
  display: grid;
  gap: 1.5rem;
}

.about-copy {
  display: grid;
  gap: 0.85rem;
}

.feature-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.feature-item {
  display: grid;
  justify-items: center;
  gap: 0.65rem;
  padding: 1.25rem 1rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  text-align: center;
}

.feature-item span {
  font-size: 1.8rem;
  line-height: 1;
}

.feature-item strong {
  color: #e2e8f0;
  font-size: 1rem;
}

.state-message {
  color: #cbd5e1;
  font-weight: 700;
}

.error-message {
  color: #fecaca;
  border-color: #dc2626;
}

@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .home-page {
    padding: 1rem;
  }

  .hero-banner {
    padding: 3rem 1.25rem;
  }

  .stats-grid,
  .feature-row {
    grid-template-columns: 1fr;
  }
}
</style>
