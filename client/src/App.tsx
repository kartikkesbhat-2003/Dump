import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Signup } from '@/pages/Signup'
import { Login } from '@/pages/Login'
import { VerifyOtp } from '@/pages/VerifyOtp'
import { AuthSuccess } from '@/pages/AuthSuccess'
import { AuthError } from '@/pages/AuthError'
import { Feed } from '@/pages/Feed'
import { PostDetails } from '@/pages/PostDetails'
import { CreatePost } from '@/pages/CreatePost'
import { Profile } from '@/pages/Profile'
import { Notifications } from '@/pages/Notifications'
import { Trending } from '@/pages/Trending'
import { PublicProfilePage } from '@/pages/PublicProfile'
import PrivateRoute from '@/components/core/auth/PrivateRoute'
import OpenRoute from './components/core/auth/OpenRoute'

function App() {
  const location = useLocation()
  const hideNavbarRoutes = ['/login', '/signup', '/verify-email', '/auth/success', '/auth/error']
  const shouldHideNavbar = hideNavbarRoutes.some(route => location.pathname.startsWith(route))

  return (
    <div className="w-screen min-h-screen flex flex-col font-inter">
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        {/* Main app routes with navigation */}
        <Route path='/' element={
          <MainLayout>
            <Feed />
          </MainLayout>
        } />
        <Route path='/post/:id' element={
          <MainLayout>
            <PostDetails />
          </MainLayout>
        } />
        <Route path='/create-post' element={
          <PrivateRoute>
            <MainLayout>
              <CreatePost />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path='/profile' element={
          <PrivateRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path='/trending' element={
          <MainLayout>
            <Trending />
          </MainLayout>
        } />
        <Route path='/user/:id' element={
          <MainLayout>
            <PublicProfilePage />
          </MainLayout>
        } />

        <Route path='/notifications' element={
          <PrivateRoute>
            <MainLayout>
              <Notifications />
            </MainLayout>
          </PrivateRoute>
        } />

        {/* Public profile route (readonly, privacy-aware) */}
        <Route path='/user/:id' element={
          <MainLayout>
            <PublicProfilePage />
          </MainLayout>
        } />

        {/* Auth routes without navigation */}
        <Route path='/signup' element={
          <AuthLayout>
            <OpenRoute>
              <Signup />
            </OpenRoute>
          </AuthLayout>
        } />
        <Route path='/login' element={
          <AuthLayout>
            <OpenRoute>
              <Login />
            </OpenRoute>
          </AuthLayout>
        } />
        <Route path='/verify-email' element={
          <AuthLayout>
            <OpenRoute>
              <VerifyOtp />
            </OpenRoute>
          </AuthLayout>
        } />

        {/* OAuth callback routes */}
        <Route path='/auth/success' element={<AuthSuccess />} />
        <Route path='/auth/error' element={<AuthError />} />
      </Routes>
    </div>
  )
}

export default App
