import './App.css'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Signup } from '@/pages/Signup'
import { Login } from '@/pages/Login'
import { VerifyOtp } from '@/pages/VerifyOtp'
import { Feed } from '@/pages/Feed'
import { PostDetails } from '@/pages/PostDetails'
import { CreatePost } from '@/pages/CreatePost'
import { Profile } from '@/pages/Profile'
import { Privacy } from '@/pages/Privacy'
import { Terms } from '@/pages/Terms'
import { Help } from '@/pages/Help'
import PrivateRoute from '@/components/core/auth/PrivateRoute'

function App() {

  return (
    <div className="w-screen min-h-screen flex flex-col font-inter">
      <Navbar />
      <Routes>
        {/* Main app routes with navigation */}
        <Route path='/' element={
          <MainLayout>
            <Feed />
          </MainLayout>
        }/>
        <Route path='/post/:id' element={
          <MainLayout>
            <PostDetails />
          </MainLayout>
        }/>
        <Route path='/create-post' element={
          <MainLayout>
            <CreatePost />
          </MainLayout>
        }/>
        <Route path='/profile' element={
          <PrivateRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </PrivateRoute>
        }/>
        <Route path='/privacy' element={
          <MainLayout>
            <Privacy />
          </MainLayout>
        }/>
        <Route path='/terms' element={
          <MainLayout>
            <Terms />
          </MainLayout>
        }/>
        <Route path='/help' element={
          <MainLayout>
            <Help />
          </MainLayout>
        }/>
        
        {/* Auth routes without navigation */}
        <Route path='/signup' element={
          <AuthLayout>
            <Signup />
          </AuthLayout>
        }/>
        <Route path='/login' element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }/>
        <Route path='/verify-email' element={
          <AuthLayout>
            <VerifyOtp />
          </AuthLayout>
        }/>
      </Routes>
    </div>
  )
}

export default App
