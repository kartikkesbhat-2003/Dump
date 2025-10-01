import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import { ScrollToTop } from '@/components/ScrollToTop.ts'
import rootReducer from '@/reducers/index.ts'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

const store= configureStore({
    reducer: rootReducer
});

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
  <BrowserRouter>
    <ScrollToTop />
      <App />
    <Toaster position='top-center' reverseOrder={false}/>
  </BrowserRouter>
  </Provider>
)
