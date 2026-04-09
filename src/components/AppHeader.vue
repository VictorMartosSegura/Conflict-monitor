<template>
  <header class="app-header">
    <RouterLink class="app-title" to="/">🌍 Global Conflict Monitor</RouterLink>

    <nav class="app-nav" aria-label="Primary navigation">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/conflicts">Conflicts</RouterLink>
      <RouterLink to="/countries">Countries</RouterLink>
    </nav>
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
  font-size: 0.95rem;
  font-weight: 600;
  transition: color 160ms ease;
}

.app-nav a:hover,
.app-nav a.router-link-exact-active {
  color: #f59e0b;
}

@media (max-width: 640px) {
  .app-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .app-nav {
    justify-content: flex-start;
  }
}
</style>
