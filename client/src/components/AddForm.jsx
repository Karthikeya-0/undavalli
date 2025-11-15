import React, { useState } from 'react'

export default function AddForm() {
  const [link, setLink] = useState('')
  const [msg, setMsg] = useState('')

  async function add() {
    if (!link.trim()) return setMsg('Enter a link')
    setMsg('Adding...')
    try {
      const res = await fetch('/api/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link })
      })
      const data = await res.json()
      setMsg(data.message || data.error || 'Done')
      setLink('')
      window.dispatchEvent(new Event('urlsUpdated'))
    } catch (e) {
      setMsg('Error: ' + e.message)
    }
  }

  return (
    <div className="card">
      <h3>Add Link</h3>
      <input value={link} onChange={e=>setLink(e.target.value)} placeholder="example.com" />
      <button onClick={add}>Add</button>
      <p>{msg}</p>
    </div>
  )
}
