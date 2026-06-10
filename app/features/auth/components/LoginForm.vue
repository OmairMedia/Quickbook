<template>
  <form @submit.prevent="handleSubmit">
    <FormField
      id="email"
      label="Email address"
      :required="true"
      :error="errors.email"
      description="We'll never share your email."
    >
      <FormInput
        id="email"
        v-model="form.email"
        type="email"
        placeholder="you@example.com"
        :error="errors.email"
      />
    </FormField>

    <FormField
      id="password"
      label="Password"
      :required="true"
      :error="errors.password"
    >
      <FormPassword
        id="password"
        v-model="form.password"
        :error="errors.password"
      />
    </FormField>

    <FormField id="remember" :required="true" :error="errors.rememberMe">
      <FormCheckbox
        id="remember"
        v-model="form.rememberMe"
        label="Remember Me"
        :error="errors.rememberMe"
      />
    </FormField>

    <button class="btn btn--primary" type="submit">Submit</button>
  </form>
</template>

<script setup>
import { useAuth } from "../composables/useAuth";

const { form, errors } = useAuth();
</script>
