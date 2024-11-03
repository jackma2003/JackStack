import React from 'react'
import ReactDOM from 'react-dom/client'
import TaskForm from './create_task'
import './input.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-100 py-8">
      <TaskForm 
        onSubmit={(task) => console.log('Task submitted:', task)}
        onDelete={(task) => console.log('Task deleted:', task)}
      />
    </div>
  </React.StrictMode>
)