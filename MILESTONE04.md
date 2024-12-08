Milestone 04 - Final Project Documentation
===

NetID
---
jm9223

Name
---
Jack Ma

Repository Link
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003

URL for deployed site 
---
http://linserv1.cims.nyu.edu:29366

URL for form 1 (from previous milestone) 
---
Frontend/Backend code for Login/Registration Form:

https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/src/register.jsx

https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/src/login.jsx

https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/routes/user.mjs

video showing result:
https://drive.google.com/file/d/1R4w9aaWbW7mwRlDCTpcN2WBXOEp3HcV-/view?usp=sharing

Special Instructions for Form 1
---
Login/Registration Page
1. Register for an account 
2. Once done it will take you to the dashboard
3. Log out and try logging in, it will work as intended
4. Remember me feature works, forgot password doesn't work (yet) 

URL for form 2 (from previous milestone) 
---
Frontend/Backend code for Create Task Form:

https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/src/projectBoard.jsx

https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/routes/tasks.mjs

Video showing Form 2 results:
https://drive.google.com/file/d/15rBMtAv3jE8RknHl6ZHeWtPEF5_XVqbI/view?usp=drive_link

Special Instructions for Form 2
---
Create Tasks Page
1. Once you are in the dashboard, create a project
2. Click view project, you will be directed into create task page
3. Click create task, you can do all CRUD functions for the tasks given
4. Special feature, you can DnD the tasks around 

URL for form 3 (for current milestone)
---
Frontend/Backend code for Friend Request System:

https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/src/findFriends.jsx

https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/src/friendRequestNotification.jsx

https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/src/friends.jsx

https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/routes/friends.mjs

https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/routes/user.mjs

Video showing Form 3 results:
https://drive.google.com/file/d/1Z_Z6Kr0tmNWxl8NI4oCxu7xrJqUKUNzA/view?usp=sharing

Special Instructions for Form 3
---
1. Once you are in dashboard there are 3 new buttons: find friends, bell icon (notification), and my friends
2. If you have no friends, my friends will redirect you to find friends
3. Search up an user with either their username or email and send them a friend request
4. The other user can click the bell icon to accept or decline the friend request 
5. Once friend request is accepted, you can view it in the my friends page 

First link to github line number(s) for constructor, HOF, etc.
---
Constructor: 
https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/db.mjs

Second link to github line number(s) for constructor, HOF, etc.
---
Higher Order Functions (HOF):
https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/src/friendRequestNotification.jsx

Short description for links above
---
Constructor: FriendRequestSchema constructor - Creates a new Schema for friend requests with properties like sender, receiver, status, and timestamp 

HOF: filter() - Used to filter friend requests to only show pending request based on their status 

Link to github line number(s) for schemas (db.js or models folder)
---
MongoDB Schemas:
https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/db.mjs

Description of research topics above with points
---
6 points - Applied React with Hooks on all Frontend pages and applied React-dnd for Task pages 

2 points - Applied Tailwind to all frontend pages for styling and organization 

2 points - Applied ESLint with Vite to configuration React.js properly 

Links to github line number(s) for research topics described above (one link per line)
---
React:
https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/src/dashboard.jsx

Tailwind:
https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/src/editProject.jsx

EsLint and Vite:
https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/vite.config.js

https://github.com/nyu-csci-ua-0467-001-002-fall-2024/final-project-jackma2003/blob/master/.eslintrc.cjs

Optional project notes 
--- 
Have fun, try to test every feature out 