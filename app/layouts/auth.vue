<script setup lang="ts">
defineProps<{
  heroHeading: string;
  heroText: string;
  formHeading?: string;
  formSubtitle?: string;
}>();
</script>

<template>
  <div class="auth-page">
    <div class="auth-split">
      <section class="auth-left-section">
        <div class="auth-hero-content">
          <div class="auth-hero-logo">QuickNotes</div>
          <h1 class="auth-hero-heading">{{ heroHeading }}</h1>
          <p class="auth-hero-text">{{ heroText }}</p>
        </div>
      </section>
      <section class="auth-right-section">
        <div v-if="formHeading" class="auth-form-header">
          <h1 class="auth-form-heading">{{ formHeading }}</h1>
          <p v-if="formSubtitle" class="auth-form-subtitle">
            {{ formSubtitle }}
          </p>
        </div>
        <slot />
      </section>
    </div>
    <UiToastContainer />
  </div>
</template>

<style scoped lang="scss">
@use "~/assets/styles/generated/tokens.scss" as *;

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-background-page;
  // padding: $spacing-scale-6;
}

.auth-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: $spacing-container-content-width;
  width: 100%;
  min-height: 600px;
  background: $color-background-page;
  border-radius: $border-radius-prominent;
  box-shadow: $shadow-subtle;
  overflow: hidden;
}

.auth-left-section {
  background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: $spacing-scale-11 $spacing-scale-10;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }
}

.auth-hero-content {
  max-width: 400px;
  margin: 0 auto;
}

.auth-hero-logo {
  font-family: $typography-family-primary;
  font-size: $typography-size-heading-2;
  font-weight: $typography-weight-bold;
  color: #ffffff;
  letter-spacing: -0.5px;
  margin-bottom: $spacing-scale-8;
  display: inline-block;

  &::before {
    content: "✦";
    margin-right: $spacing-scale-2;
    color: rgba(255, 255, 255, 0.4);
    font-size: $typography-size-body-small;
  }
}

.auth-hero-heading {
  font-family: $typography-family-primary;
  font-size: $typography-size-display-2;
  font-weight: $typography-weight-bold;
  color: $color-text-inverse;
  line-height: $typography-line-height-display-2;
  margin: 0 0 $spacing-scale-4 0;
  letter-spacing: -1px;
}

.auth-hero-text {
  font-family: $typography-family-secondary;
  font-size: $typography-size-body;
  font-weight: $typography-weight-regular;
  color: rgba(255, 255, 255, 0.6);
  line-height: $typography-line-height-body;
  margin: 0;
  max-width: 320px;
}

.auth-right-section {
  width: 100%;
  padding: $spacing-scale-0 $spacing-scale-0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: $color-background-page;
}

.auth-form-header {
  text-align: center;
  margin-bottom: $spacing-scale-8;
  max-width: 400px;
}

.auth-form-heading {
  font-family: $typography-family-primary;
  font-size: $typography-size-heading-1;
  font-weight: $typography-weight-bold;
  color: $color-text-primary;
  line-height: $typography-line-height-heading-1;
  margin: 0 0 $spacing-scale-2 0;
  letter-spacing: -0.5px;
}

.auth-form-subtitle {
  font-family: $typography-family-secondary;
  font-size: $typography-size-body;
  color: $color-text-secondary;
  line-height: $typography-line-height-body;
  margin: 0;
}

// Responsive adjustments
@media (max-width: 1024px) {
  .auth-split {
    grid-template-columns: 1fr;
    min-height: auto;
    border-radius: $border-radius-standard;
  }

  .auth-left-section {
    padding: $spacing-scale-8 $spacing-scale-6;

    &::after {
      display: none;
    }
  }

  .auth-hero-content {
    max-width: 100%;
    text-align: center;
  }

  .auth-hero-heading {
    font-size: $typography-size-heading-1;
    line-height: $typography-line-height-heading-1;
  }

  .auth-hero-text {
    max-width: 100%;
  }

  .auth-right-section {
    padding: $spacing-scale-8 $spacing-scale-6;
  }
}

@media (max-width: 640px) {
  .auth-page {
    padding: $spacing-scale-4;
  }

  .auth-left-section {
    padding: $spacing-scale-6 $spacing-scale-4;
  }

  .auth-hero-heading {
    font-size: $typography-size-heading-2;
    line-height: $typography-line-height-heading-2;
  }

  .auth-right-section {
    padding: $spacing-scale-6 $spacing-scale-4;
  }
}
</style>
