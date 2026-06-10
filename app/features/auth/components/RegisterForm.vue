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

    <FormField id="role" label="Role" :error="errors.role">
      <FormSelect
        id="role"
        v-model="form.role"
        :options="roleOptions"
        placeholder="Select a role"
        :error="errors.role"
      />
    </FormField>

    <FormCheckbox id="agree" v-model="form.agree" :error="errors.agree">
      I agree to the <a href="/terms">terms of service</a>
    </FormCheckbox>

    <button class="btn btn--primary" type="submit">Submit</button>
  </form>
</template>

<script setup>
import { reactive } from "vue";

const form = reactive({
  email: "",
  password: "",
  role: "",
  agree: false,
});

const errors = reactive({
  email: "",
  password: "",
  role: "",
  agree: "",
});

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

function handleSubmit() {
  // validate and submit
}
</script>
