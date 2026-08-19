import { useEffect, useRef } from 'react'
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState
} from '@microsoft/signalr'
import { toast } from 'sonner'

const HUB_URL = 'https://localhost:7065/hubs/notification'
const EVENT_NAME = 'ReceiveNotification'
const CUSTOM_EVENT = 'new_notification'

export interface SignalRNotificationPayload {
  title?: string
  content?: string
  body?: string
  createdAt?: string
  [key: string]: unknown
}

export const useSignalR = () => {
  const connectionRef = useRef<HubConnection | null>(null)
  const tokenRef = useRef<string | null>(null)

  useEffect(() => {
    const handleReceiveNotification = (payload: SignalRNotificationPayload) => {
      const displayText =
        payload?.title ||
        payload?.content ||
        payload?.body ||
        'Bạn có thông báo mới'

      toast.info(displayText)
      window.dispatchEvent(
        new CustomEvent(CUSTOM_EVENT, {
          detail: payload
        })
      )
    }

    let pollId: number | undefined

    const buildConnection = (token: string) => {
      const connection = new HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build()

      connectionRef.current = connection
      connection.on(EVENT_NAME, handleReceiveNotification)

      const startConnection = async () => {
        if (connection.state !== HubConnectionState.Disconnected) return

        try {
          await connection.start()
        } catch (error) {
          console.error('SignalR connection error', error)
        }
      }

      void startConnection()
    }

    const tryInitConnection = () => {
      const token =
        localStorage.getItem('accessToken') || localStorage.getItem('token')

      if (!token || tokenRef.current === token) return false

      tokenRef.current = token
      buildConnection(token)
      return true
    }

    if (!tryInitConnection()) {
      pollId = window.setInterval(() => {
        if (tryInitConnection() && pollId) {
          window.clearInterval(pollId)
          pollId = undefined
        }
      }, 1000)
    }

    return () => {
      if (pollId) window.clearInterval(pollId)

      const connection = connectionRef.current

      if (connection) {
        connection.off(EVENT_NAME, handleReceiveNotification)
        if (connection.state !== HubConnectionState.Disconnected) {
          void connection.stop()
        }
      }
    }
  }, [])
}
