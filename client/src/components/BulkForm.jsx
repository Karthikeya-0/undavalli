import React, { useState } from 'react'

export default function BulkForm() {
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')

  async function bulk() {
    const links = text.split(/\r?\n|,/).map(s=>s.trim()).filter(Boolean)
    if (!links.length) return setMsg('No links found')
    setMsg('Uploading...')
    try {
      const res = await fetch('/api/bulk-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links })
      })
      const data = await res.json()
      setMsg(`Inserted: ${data.insertedCount || 0}, Invalid: ${data.invalid?.length || 0}`)
      setText('')
      window.dispatchEvent(new Event('urlsUpdated'))
    } catch (e) {
      setMsg('Error: ' + e.message)
    }
  }

  return (
    <div className="card">
      <h3>Bulk Add</h3>
      <textarea rows={5} value={text} onChange={e=>setText(e.target.value)} placeholder="one link per line"></textarea>
      <button onClick={bulk}>Upload</button>
      <p>{msg}</p>
    </div>
  )
}
