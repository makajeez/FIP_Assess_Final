import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import '@/styles/index.css'

// AuthProvider and Toaster live inside the router's RootLayout component
// so they are guaranteed to be mounted before any route renders.
// Do NOT wrap RouterProvider with AuthProvider here — that causes
// "useAuth must be used inside <AuthProvider>" on Vercel and production builds.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
