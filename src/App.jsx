import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import PostGenerator from './pages/PostGenerator'
import PostTutorial from './pages/PostTutorial'
import Assistant from './pages/Assistant'

/*
  App.jsx
  - Sets up React Router and the top-level layout.
  - Routes:
    / or /generator -> PostGenerator
    /tutorial -> SavedPosts
    /assistant -> Assistant
*/

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/generator" replace />} />
          <Route path="generator" element={<PostGenerator />} />
          <Route path="tutorial" element={<PostTutorial />} />
          <Route path="assistant" element={<Assistant />} />
        </Route>
        <Route path="*" element={<Navigate to="/generator" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
