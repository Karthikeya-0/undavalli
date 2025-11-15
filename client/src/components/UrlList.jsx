import React, { useEffect, useState } from 'react'

export default function UrlList() {
  const [urls, setUrls] = useState([])

  async function load() {
    const res = await fetch('/api/urls')
    const data = await res.json()
    setUrls(data)
  }

  async function del(id) {
    if (!confirm('Delete this entry?')) return
    const res = await fetch(`/api/delete/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) load()
  }

  useEffect(()=>{
    load()
    const update = ()=>load()
    window.addEventListener('urlsUpdated', update)
    return ()=>window.removeEventListener('urlsUpdated', update)
  },[])

  return (
    <div className="card">
      <h3>Recent URLs</h3>
      <table>
        <thead><tr><th>Link</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {urls.map(u=>(
            <tr key={u._id}>
              <td>{u.link}</td>
              <td>{u.isFraud ? '🚨 Fraud' : '✅ Safe'}</td>
              <td><button onClick={()=>del(u._id)}>🗑 Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
