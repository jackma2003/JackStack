import React from 'react'
import ReactDOM from 'react-dom/client'
import TaskForm from './create_task'
import './input.css'
import LoginPage from './login'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-100 py-8">
      <LoginPage/>
    </div>
  </React.StrictMode>
)