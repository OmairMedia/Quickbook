import { ref, type Ref } from "vue";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastInstance {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  action?: ToastAction;
}

const toasts = ref<ToastInstance[]>([]) as Ref<ToastInstance[]>;
let counter = 0;

export function useToast() {
  function add(toast: Omit<ToastInstance, "id">): string {
    const id = `toast-${++counter}`;
    toasts.value = [...toasts.value, { ...toast, id }];
    return id;
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function clear() {
    toasts.value = [];
  }

  function success(
    message: string,
    options?: { title?: string; duration?: number },
  ) {
    add({
      type: "success",
      message,
      duration: options?.duration ?? 4000,
      title: options?.title,
    });
  }

  function error(
    message: string,
    options?: { title?: string; duration?: number },
  ) {
    add({
      type: "error",
      message,
      duration: options?.duration ?? 6000,
      title: options?.title,
    });
  }

  function warning(
    message: string,
    options?: { title?: string; duration?: number },
  ) {
    add({
      type: "warning",
      message,
      duration: options?.duration ?? 5000,
      title: options?.title,
    });
  }

  function info(
    message: string,
    options?: { title?: string; duration?: number },
  ) {
    add({
      type: "info",
      message,
      duration: options?.duration ?? 4000,
      title: options?.title,
    });
  }

  return { toasts, add, remove, clear, success, error, warning, info };
}
