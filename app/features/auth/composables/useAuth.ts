// Auth State and Logics
import { reactive } from "vue";

export const useAuth = () => {
  const form = reactive({
    email: "",
    password: "",
    rememberMe: false,
  });

  const errors = reactive({
    email: "",
    password: "",
    rememberMe: "",
  });

  function handleSubmit() {
    // validate and submit
  }

  return {
    form,
    errors,
    handleSubmit,
  };
};
