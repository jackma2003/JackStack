# JackStack - Project Management Tool

## Overview

Managing projects and team collaboration effectively can be challenging without proper tools and organization. That's where JackStack comes in!

JackStack is a web-based project management application built on the MERN stack that helps teams collaborate efficiently. Users can create projects, manage tasks using a Kanban board interface, track progress, and communicate in real-time. The application provides features like drag-and-drop task management, real-time updates, task assignments, and project analytics.

## Data Model

The application will store Users, Projects, Tasks, and Comments

* Users can have multiple projects (via references)
* Projects can have multiple tasks (via references)
* Tasks can have multiple comments (by embedding)
* Tasks can be assigned to users (via references)

### Example Documents:

An Example User:
```javascript
{
  username: "johndoe",
  email: "john@example.com",
  hash: // password hash,
  avatar: "url_to_avatar",
  projects: // array of references to Project documents
  createdAt: // timestamp
}
```
An Example Project:
```javascript
{
  name: "Website Redesign",
  description: "Redesign company website with new branding",
  owner: // reference to User object
  members: // array of references to User objects,
  status: "active",
  createdAt: // timestamp,
  updatedAt: // timestamp
}
```
An Example Task:
```javascript 
{
  project: // reference to Project object
  title: "Design Homepage Mockup",
  description: "Create initial mockup for homepage design",
  status: "in-progress", // ["todo", "in-progress", "review", "done"]
  priority: "high", // ["low", "medium", "high"]
  assignee: // reference to User object
  creator: // reference to User object
  dueDate: // date
  position: 1, // position in the column
  labels: ["design", "frontend"],
  comments: [
    {
      user: // reference to User object,
      content: "First draft completed, need feedback",
      createdAt: // timestamp
    }
  ],
  createdAt: // timestamp,
  updatedAt: // timestamp
}
```

## [Link to Commented First Draft Schema](db.mjs)

## WireFrames 

/login - User authentication page 
![Login Page](documentation/login.png)

/dashboard - Main dashboard showing all projects 
![Dashboard](documentation/dashboard.png)

/project/:id - Project board with Kanban view
![Project Board](documentation/project.png) 

/project/:id/settings - Project settings page
![Project Setting](documentation/project:setting.png)

