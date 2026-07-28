import { useToastContext, type ToastMethods } from './toast-context'

export type { ToastMethods }

export function useToast(): ToastMethods {
  return useToastContext()
}