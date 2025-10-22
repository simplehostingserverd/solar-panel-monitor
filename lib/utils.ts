import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface AxiosError {
  response?: {
    data?: unknown
    status?: number
  }
  message?: string
}

export function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'response' in error
}

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.response?.data ? JSON.stringify(error.response.data) : error.message || 'Unknown error'
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export function getErrorStatus(error: unknown): number {
  if (isAxiosError(error)) {
    return error.response?.status || 500
  }
  return 500
}
