import axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie'

export interface AxiosErrorResponse {
  code?: string
  message?: string
  detail?: string
}

interface FailedRequest {
  onSuccess: (access: string) => void
  onFailure: (err: AxiosError<AxiosErrorResponse>) => void
}

let access = Cookies.get('convite-casamento.access')
let refresh = Cookies.get('convite-casamento.refresh')

let isRefreshing = false

let failedRequestsQueue: FailedRequest[] = []

export const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || 'http://localhost:8080',
})

if (access) {
  api.defaults.headers.common.Authorization = `Bearer ${access}`
} else {
  delete api.defaults.headers.common.Authorization
}

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError<AxiosErrorResponse>) => {
    if (error?.response?.status === 401) {
      refresh = Cookies.get('convite-casamento.refresh')
      const originalConfig = error.config
      if (!isRefreshing) {
        isRefreshing = true
        api
          .patch('/api/admin/token/refresh', {
            refresh,
          })
          .then((response) => {
            access = response.data.access

            Cookies.set('convite-casamento.access', access!, {
              expires: 1 / 24 / 2, // 30 minutes
              path: '/',
            })

            Cookies.set('convite-casamento.refresh', response.data.refresh, {
              expires: 7, // 7 days
              path: '/',
            })

            api.defaults.headers.common.Authorization = `Bearer ${access}`
            failedRequestsQueue.forEach((request) => request.onSuccess(access!))
            failedRequestsQueue = []
          })
          .catch((err) => {
            failedRequestsQueue.forEach((request) => request.onFailure(err))
            failedRequestsQueue = []
            Cookies.remove('convite-casamento.access')
            Cookies.remove('convite-casamento.refresh')
            window.location.href = '/admin/login'
          })
          .finally(() => {
            isRefreshing = false
          })
      }
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          onSuccess: (access: string) => {
            originalConfig!.headers!.Authorization = `Bearer ${access}`
            resolve(api(originalConfig!))
          },
          onFailure: (err: AxiosError<AxiosErrorResponse>) => {
            reject(err)
          },
        })
      })
    }
    return Promise.reject(error)
  },
)