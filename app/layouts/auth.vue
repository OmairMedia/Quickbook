<template>
  <div class="auth-page">
    <div class="auth-split">
      <div class="auth-hero">
        <div class="auth-hero-content">
          <div class="auth-hero-logo">QuickNotes</div>
          <h1 class="auth-hero-heading">{{ heroHeading }}</h1>
          <p class="auth-hero-text">{{ heroText }}</p>
          <div v-if="showFeatures" class="auth-hero-features">
            <div class="auth-hero-feature">
              <span class="auth-hero-feature-text"
                >Unlimited notes and notebooks</span
              >
            </div>
            <div class="auth-hero-feature">
              <span class="auth-hero-feature-text"
                >Markdown support and rich editing</span
              >
            </div>
            <div class="auth-hero-feature">
              <span class="auth-hero-feature-text"
                >Sync across all your devices</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="auth-form-panel">
        <div class="auth-centered">
          <div v-if="formHeading" class="auth-header">
            <h1 class="auth-header-title">{{ formHeading }}</h1>
            <p v-if="formSubtitle" class="auth-header-subtitle">
              {{ formSubtitle }}
            </p>
          </div>
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  heroHeading: string;
  heroText: string;
  showFeatures?: boolean;
  formHeading?: string;
  formSubtitle?: string;
}>();
</script>
