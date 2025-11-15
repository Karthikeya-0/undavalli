import React from 'react'
import AddForm from './components/AddForm'
import CheckForm from './components/CheckForm'
import BulkForm from './components/BulkForm'
import UrlList from './components/UrlList'
import './index.css'

export default function App() {
  return (
    <div style={{ padding: 20, fontFamily: 'Inter, Arial', background: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ color: '#0b69ff' }}>🚨 Fraud URL Detection System</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ width: 400 }}>
          <AddForm />
          <BulkForm />
        </div>
        <div style={{ width: 400 }}>
          <CheckForm />
          <UrlList />
        </div>
      </div>
    </div>
  )
}
