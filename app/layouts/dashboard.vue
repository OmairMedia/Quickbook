<template>
  <div class="dashboard">
    <div
      class="dashboard-sidebar-overlay"
      :class="{ 'dashboard-sidebar-overlay--visible': sidebarOpen }"
      @click="sidebarOpen = false"
    ></div>

    <aside
      class="dashboard-sidebar"
      :class="{ 'dashboard-sidebar--open': sidebarOpen }"
    >
      <div class="dashboard-sidebar-header">
        <NuxtLink to="/dashboard" class="dashboard-sidebar-logo">
          <span class="dashboard-sidebar-logo-text">QuickNotes</span>
        </NuxtLink>
        <button class="dashboard-sidebar-close" @click="sidebarOpen = false">
          &times;
        </button>
      </div>

      <nav class="dashboard-sidebar-nav">
        <NuxtLink
          to="/dashboard"
          class="dashboard-sidebar-link"
          :class="{
            'dashboard-sidebar-link--active': $route.path === '/dashboard',
          }"
        >
          My Notes
        </NuxtLink>
      </nav>

      <div class="dashboard-sidebar-footer">
        <div class="dashboard-sidebar-user">
          <div class="dashboard-sidebar-user-avatar">
            {{ userInitial }}
          </div>
          <div class="dashboard-sidebar-user-info">
            <span class="dashboard-sidebar-user-name">{{ userName }}</span>
            <span class="dashboard-sidebar-user-email">{{ userEmail }}</span>
          </div>
        </div>
        <button class="dashboard-sidebar-logout" @click="handleLogout">
          Sign out
        </button>
      </div>
    </aside>

    <div class="dashboard-main">
      <header class="dashboard-topbar">
        <button class="dashboard-topbar-menu-btn" @click="sidebarOpen = true">
          <span class="dashboard-topbar-menu-icon">&#x2630;</span>
        </button>
        <div class="dashboard-topbar-spacer"></div>
        <div class="dashboard-topbar-actions"></div>
      </header>

      <main class="dashboard-content">
        <slot />
      </main>
      <UiToastContainer />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthSession } from "~/features/auth/composables/useAuthSession";
import { useAuthStore } from "~/features/auth/stores/auth.store";

const { user, clearSession } = useAuthSession();
const router = useRouter();
const sidebarOpen = ref(false);

const userName = computed(() => user.value?.name ?? "User");
const userEmail = computed(() => user.value?.email ?? "");
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

async function handleLogout() {
  await useAuthStore().logout();
  await clearSession();
  router.push("/auth/login");
}
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--app-color-cream-default);
}

/* Sidebar */
.dashboard-sidebar {
  width: 260px;
  background: var(--app-color-white);
  border-right: 1px solid var(--app-color-gray-light);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.dashboard-sidebar-overlay {
  display: none;
}

.dashboard-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--app-spacing-scale-5) var(--app-spacing-scale-4);
  border-bottom: 1px solid var(--app-color-gray-light);
}

.dashboard-sidebar-logo {
  text-decoration: none;
}

.dashboard-sidebar-logo-text {
  font-size: var(--app-typography-size-heading-3);
  font-weight: var(--app-typography-weight-bold);
  color: var(--app-color-black);
}

.dashboard-sidebar-close {
  display: none;
}

.dashboard-sidebar-nav {
  flex: 1;
  padding: var(--app-spacing-scale-3) var(--app-spacing-scale-2);
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-scale-1);
}

.dashboard-sidebar-link {
  display: block;
  padding: var(--app-spacing-scale-2) var(--app-spacing-scale-3);
  font-size: var(--app-typography-size-body-small);
  font-weight: var(--app-typography-weight-medium);
  color: var(--app-color-black);
  text-decoration: none;
  border-radius: var(--app-border-radius-minimal);
  transition: background 0.15s ease;
}

.dashboard-sidebar-link:hover {
  background: var(--app-color-gray-light);
}

.dashboard-sidebar-link--active {
  background: var(--app-color-blue-surface);
  color: var(--app-color-blue-deep);
}

.dashboard-sidebar-footer {
  padding: var(--app-spacing-scale-4);
  border-top: 1px solid var(--app-color-gray-light);
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-scale-3);
}

.dashboard-sidebar-user {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-scale-3);
}

.dashboard-sidebar-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--app-border-radius-circle);
  background: var(--app-color-blue-primary);
  color: var(--app-color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--app-typography-size-body-small);
  font-weight: var(--app-typography-weight-semibold);
  flex-shrink: 0;
}

.dashboard-sidebar-user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dashboard-sidebar-user-name {
  font-size: var(--app-typography-size-body-small);
  font-weight: var(--app-typography-weight-medium);
  color: var(--app-color-black);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-sidebar-user-email {
  font-size: var(--app-typography-size-caption);
  color: var(--app-color-gray-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-sidebar-logout {
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--app-typography-size-body-small);
  color: var(--app-color-gray-dark);
  text-align: left;
  padding: 0;
  transition: color 0.15s ease;
}

.dashboard-sidebar-logout:hover {
  color: var(--app-color-red-error);
}

/* Main content */
.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dashboard-topbar {
  display: none;
}

.dashboard-content {
  flex: 1;
  padding: var(--app-spacing-scale-6) var(--app-spacing-scale-8);
  overflow-y: auto;
}

/* Mobile responsive */
@media (max-width: 767px) {
  .dashboard-sidebar {
    position: fixed;
    left: -260px;
    top: 0;
    bottom: 0;
    z-index: 100;
    transition: left 0.2s ease;
  }

  .dashboard-sidebar--open {
    left: 0;
  }

  .dashboard-sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 99;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .dashboard-sidebar-overlay--visible {
    opacity: 1;
    pointer-events: auto;
  }

  .dashboard-sidebar-close {
    display: block;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--app-color-gray-dark);
  }

  .dashboard-topbar {
    display: flex;
    align-items: center;
    padding: var(--app-spacing-scale-3) var(--app-spacing-scale-4);
    background: var(--app-color-white);
    border-bottom: 1px solid var(--app-color-gray-light);
  }

  .dashboard-topbar-menu-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--app-spacing-scale-1);
  }

  .dashboard-topbar-menu-icon {
    font-size: 20px;
    color: var(--app-color-black);
  }

  .dashboard-topbar-spacer {
    flex: 1;
  }

  .dashboard-content {
    padding: var(--app-spacing-scale-4);
  }
}
</style>
