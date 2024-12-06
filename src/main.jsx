import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './input.css'
import LoginPage from './login'
import RegisterPage from './register'
import Dashboard from "./dashboard"
import ResetPassword from './resetPassword';
import ProjectBoard from './projectBoard'
import ProfileSettings from './profileSettings'
import EditProject from './editProject'
import FindFriends from './findFriends'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 py-8">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/reset-password/:token" element={<ResetPassword/>}/>
          <Route path="/project/:id" element={<ProjectBoard/>}/>
          <Route path="/profile" element={<ProfileSettings/>}/>
          <Route path="/project/:id/edit" element={<EditProject/>}/>
          <Route path="/find-friends" element={<FindFriends />} />
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>
)