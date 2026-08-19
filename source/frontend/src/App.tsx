import { RouterProvider } from 'react-router-dom'
import { router } from '~/core/router'
import { useSignalR } from '@/hooks/useSignalR'

function App() {
  useSignalR()
  return <RouterProvider router={router} />
}

export default App
