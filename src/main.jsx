import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TaskForm from './create_task'
import './input.css'
import LoginPage from './login'
import RegisterPage from './register'
import Dashboard from "./dashboard"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 py-8">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/create-task" element={<TaskForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>
)