import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import { ScrollToTop } from '@/components/ScrollToTop.ts'
import rootReducer from '@/reducers/index.ts'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

const store = configureStore({
  reducer: rootReducer
});

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <ScrollToTop />
      <App />
      <Toaster
        position='top-center'
        reverseOrder={false}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: 'rgba(17, 17, 17, 0.95)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '12px 16px',
            fontSize: '14px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          },
          // Success toast styling
          success: {
            duration: 3000,
            style: {
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(24px)',
            },
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          // Error toast styling
          error: {
            duration: 4000,
            style: {
              background: 'rgba(220, 38, 38, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(24px)',
            },
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
          // Loading toast styling
          loading: {
            style: {
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(24px)',
            },
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </BrowserRouter>
  </Provider>
)
