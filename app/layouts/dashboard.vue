<template>
  <div class="dashboard">
    <!-- Overlay -->
    <div class="dashboard-sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Sidebar -->
    <aside class="dashboard-sidebar" id="sidebar">
      <div class="dashboard-sidebar-header">
        <a href="/" class="dashboard-sidebar-logo">
          <img src="/logo.svg" alt="" class="dashboard-sidebar-logo-icon" />
          <span class="dashboard-sidebar-logo-text">AppName</span>
        </a>
        <button class="dashboard-sidebar-toggle" id="sidebarToggle">
          <!-- chevron icon -->
        </button>
      </div>

      <nav class="dashboard-sidebar-nav">
        <!-- Links go here -->
      </nav>

      <div class="dashboard-sidebar-footer">
        <!-- User widget -->
      </div>
    </aside>

    <!-- Main -->
    <div class="dashboard-main">
      <header class="dashboard-topbar">
        <button class="dashboard-topbar-menu-btn" id="menuBtn">
          <!-- hamburger icon -->
        </button>
        <span class="dashboard-topbar-title">Page Title</span>
        <div class="dashboard-topbar-spacer"></div>
        <div class="dashboard-topbar-actions">
          <!-- action buttons -->
        </div>
      </header>

      <main class="dashboard-content">
        <!-- Page content goes here -->
      </main>
      <UiToastContainer />
    </div>
  </div>
</template>
