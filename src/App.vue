<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <RouterLink to="/">EmiyaOJ</RouterLink>
        </div>
        <nav class="main-nav">
          <RouterLink to="/problems" class="nav-link">题目列表</RouterLink>
          <RouterLink to="/submissions" class="nav-link">提交记录</RouterLink>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <footer class="app-footer">
      <p>© 2025 EmiyaOJ - Online Judge System</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo a {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
  text-decoration: none;
}

.logo a:hover {
  opacity: 0.8;
}

.main-nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  color: var(--color-text);
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 14px;
}

.nav-link:hover {
  background: var(--color-background-mute);
}

.nav-link.router-link-active {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.app-main {
  flex: 1;
  background: var(--color-background);
}

.app-footer {
  background: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
  padding: 20px;
  text-align: center;
}

.app-footer p {
  color: var(--color-text);
  opacity: 0.7;
  font-size: 14px;
  margin: 0;
}
</style>
