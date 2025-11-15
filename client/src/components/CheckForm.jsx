import React, { useState } from 'react'

export default function CheckForm() {
  const [link, setLink] = useState('')
  const [result, setResult] = useState('')

  async function check() {
    if (!link.trim()) return setResult('Enter a link')
    setResult('Checking...')
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link })
      })
      const data = await res.json()
      if (!res.ok) return setResult(data.error || 'Error')
      if (!data.found) return setResult('❌ Not in database')
      setResult(data.data.isFraud ? '🚨 Fraud' : '✅ Safe')
    } catch (e) {
      setResult('Error: ' + e.message)
    }
  }

  return (
    <div className="card">
      <h3>Check Link</h3>
      <input value={link} onChange={e=>setLink(e.target.value)} placeholder="example.com" />
      <button onClick={check}>Check</button>
      <p>{result}</p>
    </div>
  )
}
