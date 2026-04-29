import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function ModuleReader() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [mod, setMod] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [markedRead, setMarkedRead] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/'); return }
      setUserId(user.id)

      const { data: moduleData } = await supabase
        .from('modules')
        .select('*')
        .eq('id', parseInt(moduleId))
        .single()

      setMod(moduleData)
      setLoading(false)

      // Check if already marked read
      const { data: existing } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', parseInt(moduleId))
        .maybeSingle()

      if (existing?.module_read) {
        setMarkedRead(true)
      }
    }
    init()
  }, [moduleId])

  async function handleMarkRead() {
    if (!userId || markedRead) return

    const { data: existing } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', parseInt(moduleId))
      .maybeSingle()

    if (existing) {
      await supabase
        .from('progress')
        .update({ module_read: true })
        .eq('user_id', userId)
        .eq('module_id', parseInt(moduleId))
    } else {
      await supabase
        .from('progress')
        .insert({
          user_id: userId,
          module_id: parseInt(moduleId),
          module_read: true,
          quiz_passed: false,
          quiz_score: 0,
          badge_earned: false,
        })
    }

    setMarkedRead(true)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #050d1a, #071524)', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#7dd3fc', fontSize: '16px' }}>Loading module...</p>
      </div>
    )
  }

  if (!mod) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #050d1a, #071524)', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#fca5a5', fontSize: '16px' }}>Module not found.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #050d1a 0%, #071524 100%)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <div style={{ flex: 1, padding: '32px', maxWidth: '760px', margin: '0 auto', width: '100%' }}>

          {/* Back button */}
          <button
            onClick={() => navigate('/modules')}
            style={{ background: 'none', border: 'none', color: 'rgba(56,189,248,0.5)', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '24px', display: 'block' }}
          >
            ← Back to Modules
          </button>

          {/* Module title */}
          <h1 style={{ color: '#e0f2fe', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            {mod.title}
          </h1>
          <p style={{ color: 'rgba(56,189,248,0.4)', fontSize: '12px', marginBottom: '32px' }}>
            {mod.language} · Cybersecurity Awareness
          </p>

          {/* Module content */}
          <div style={{
            background: 'rgba(14,165,233,0.06)',
            border: '1px solid rgba(14,165,233,0.15)',
            borderRadius: '14px',
            padding: '28px',
            color: 'rgba(255,255,255,0.75)',
            fontSize: '15px',
            lineHeight: '1.9',
            marginBottom: '32px',
            whiteSpace: 'pre-wrap',
          }}>
            {mod.content}
          </div>

          {/* Mark as read + Take Quiz */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleMarkRead}
              disabled={markedRead}
              style={{
                padding: '10px 22px',
                background: markedRead ? 'rgba(34,197,94,0.15)' : 'rgba(14,165,233,0.15)',
                border: `1px solid ${markedRead ? 'rgba(34,197,94,0.4)' : 'rgba(14,165,233,0.35)'}`,
                borderRadius: '8px',
                color: markedRead ? '#86efac' : '#38bdf8',
                fontSize: '14px',
                fontWeight: '500',
                cursor: markedRead ? 'default' : 'pointer',
              }}
            >
              {markedRead ? '✓ Marked as Read' : '✓ Mark as Read'}
            </button>

            <button
              onClick={() => navigate(`/quiz/${moduleId}`)}
              style={{
                padding: '10px 22px',
                background: '#0ea5e9',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              🧠 Take Quiz
            </button>
          </div>

          {!markedRead && (
            <p style={{ fontSize: '12px', color: 'rgba(239,68,68,0.5)', marginTop: '10px' }}>
              Tip: Mark this module as read before taking the quiz — both are required to earn your badge.
            </p>
          )}

        </div>
      </div>
    </div>
  )
}