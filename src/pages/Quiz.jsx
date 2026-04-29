import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useQuiz } from '../hooks/useQuiz'

const BADGE_MAP = {
  1: { name: 'Phishing Pro', icon: '🎣' },
  2: { name: 'Password Guard', icon: '🔑' },
  3: { name: 'Scam Spotter', icon: '⚠️' },
  4: { name: 'Social Shield', icon: '👥' },
  5: { name: 'Safe Surfer', icon: '🌐' },
  6: { name: 'Privacy Expert', icon: '🔒' },
}

export default function Quiz() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const parsedId = parseInt(moduleId)
  const { questions, loading, error } = useQuiz(parsedId)

  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [user, setUser] = useState(null)
  const [moduleTitle, setModuleTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [lang] = useState('en')

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { navigate('/login'); return }
      setUser(data.user)
      const { data: mod } = await supabase.from('modules').select('title').eq('id', parsedId).maybeSingle()
      if (mod) setModuleTitle(mod.title)
    }
    init()
  }, [])

  const handleSelect = (letter) => {
    if (submitted) return
    setSelected(letter)
  }

  const handleNext = async () => {
    if (!selected) return
    const newAnswers = [...answers, { questionId: questions[currentQ].id, selected, correct: questions[currentQ].correct_answer }]
    setAnswers(newAnswers)
    setSelected(null)

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1)
    } else {
      // Calculate score
      const correct = newAnswers.filter(a => a.selected === a.correct).length
      const pct = Math.round((correct / questions.length) * 100)
      setScore(pct)
      setSubmitted(true)
      await saveResult(pct)
    }
  }

  const saveResult = async (pct) => {
    setSaving(true)
    const passed = pct >= 80
    const badge = BADGE_MAP[parsedId]

    // Check if progress row exists
    const { data: existing } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', parsedId)
      .maybeSingle()

    const moduleRead = existing?.module_read || false
    const badgeEarned = passed && moduleRead

    if (existing) {
      await supabase.from('progress').update({
        quiz_score: pct,
        quiz_passed: passed,
        badge_earned: badgeEarned,
        badge_name: badge?.name || '',
        badge_icon: badge?.icon || '',
        badge_id: parsedId,
        module_title: moduleTitle,
      }).eq('id', existing.id)
    } else {
      await supabase.from('progress').insert({
        user_id: user.id,
        module_id: parsedId,
        quiz_score: pct,
        quiz_passed: passed,
        badge_earned: false,
        badge_name: badge?.name || '',
        badge_icon: badge?.icon || '',
        badge_id: parsedId,
        module_title: moduleTitle,
        module_read: false,
      })
    }
    setSaving(false)
  }

  const passed = score >= 80
  const progress = ((currentQ) / (questions.length || 1)) * 100

  if (loading) return (
    <div style={styles.loadPage}>
      <div style={styles.loadIcon}>🧠</div>
      <div style={styles.loadText}>Loading quiz...</div>
    </div>
  )

  if (error || questions.length === 0) return (
    <div style={styles.loadPage}>
      <div style={styles.loadIcon}>📭</div>
      <div style={styles.loadText}>No questions found for this module yet.</div>
      <button style={styles.backBtn} onClick={() => navigate('/modules')}>← Back to modules</button>
    </div>
  )

  // RESULT SCREEN
  if (submitted) return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.resultWrap}>
        <div style={{ ...styles.resultCard, borderColor: passed ? 'rgba(14,165,233,0.3)' : 'rgba(226,75,74,0.3)' }}>
          <div style={styles.resultIcon}>{passed ? '🏆' : '📚'}</div>
          <div style={styles.resultScore} >
            <span style={{ ...styles.scoreNum, color: passed ? '#38bdf8' : '#fca5a5' }}>{score}%</span>
          </div>
          <h2 style={styles.resultTitle}>
            {passed ? 'Quiz passed!' : 'Not quite there yet'}
          </h2>
          <p style={styles.resultSub}>
            {passed
              ? `You scored ${score}% — you've passed the ${moduleTitle} quiz!`
              : `You scored ${score}% — you need 80% or above to pass. Keep studying!`}
          </p>

          {passed && (
            <div style={styles.badgeEarned}>
              <div style={styles.badgeEarnedIcon}>{BADGE_MAP[parsedId]?.icon}</div>
              <div>
                <div style={styles.badgeEarnedTitle}>
                  {BADGE_MAP[parsedId]?.name} badge {saving ? 'saving...' : 'unlocked!'}
                </div>
                <div style={styles.badgeEarnedSub}>
                  Read the module + passed the quiz ✓
                </div>
              </div>
            </div>
          )}

          <div style={styles.resultReview}>
            <div style={styles.reviewTitle}>Your answers</div>
            {answers.map((a, i) => (
              <div key={i} style={{ ...styles.reviewRow, borderColor: a.selected === a.correct ? 'rgba(14,165,233,0.2)' : 'rgba(226,75,74,0.2)', background: a.selected === a.correct ? 'rgba(14,165,233,0.06)' : 'rgba(226,75,74,0.06)' }}>
                <div style={styles.reviewQ}>Q{i + 1}: {questions[i]?.question}</div>
                <div style={{ ...styles.reviewStatus, color: a.selected === a.correct ? '#38bdf8' : '#fca5a5' }}>
                  {a.selected === a.correct ? '✓ Correct' : `✗ Wrong — correct answer was ${a.correct.toUpperCase()}`}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.resultBtns}>
            <button style={styles.btnPrimary} onClick={() => navigate('/badges')}>View badges →</button>
            <button style={styles.btnGhost} onClick={() => navigate('/modules')}>Back to modules</button>
            {!passed && (
              <button style={styles.btnRetry} onClick={() => { setCurrentQ(0); setAnswers([]); setSelected(null); setSubmitted(false); setScore(0) }}>
                Retry quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // QUIZ SCREEN
  const q = questions[currentQ]
  const options = [
    { letter: 'a', text: q.option_a },
    { letter: 'b', text: q.option_b },
    { letter: 'c', text: q.option_c },
    { letter: 'd', text: q.option_d },
  ]

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* TOPBAR */}
      <div style={styles.topbar}>
        <button style={styles.backLink} onClick={() => navigate('/modules')}>← Back to modules</button>
        <div style={styles.topbarLogo}>
          <div style={styles.topbarLogoIcon}>🛡</div>
          <span style={styles.topbarLogoText}>NetWise PNG</span>
        </div>
        <button style={styles.exitBtn} onClick={() => navigate('/modules')}>Exit quiz</button>
      </div>

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.heroMeta}>
          <span style={styles.moduleTag}>{BADGE_MAP[parsedId]?.icon} {moduleTitle || 'Quiz'}</span>
          <span style={styles.qCounter}>Question {currentQ + 1} of {questions.length} · 80% to pass</span>
        </div>
        <h1 style={styles.question}>{q.question}</h1>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      </div>

      {/* OPTIONS GRID */}
      <div style={styles.optionsGrid}>
        {options.map((opt) => (
          <div
            key={opt.letter}
            style={{
              ...styles.option,
              ...(selected === opt.letter ? styles.optionSelected : {}),
            }}
            onClick={() => handleSelect(opt.letter)}
            onMouseEnter={e => { if (selected !== opt.letter) { e.currentTarget.style.background = 'rgba(14,165,233,0.08)'; e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
            onMouseLeave={e => { if (selected !== opt.letter) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' } }}
          >
            <div style={{ ...styles.optKey, ...(selected === opt.letter ? styles.optKeySelected : {}) }}>
              {opt.letter.toUpperCase()}
            </div>
            <div style={{ ...styles.optText, color: selected === opt.letter ? '#fff' : 'rgba(255,255,255,0.65)' }}>
              {opt.text}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM BAR */}
      <div style={styles.bottomBar}>
        <div style={styles.dots}>
          {questions.map((_, i) => (
            <div key={i} style={{
              ...styles.dot,
              background: i < currentQ ? '#0ea5e9' : i === currentQ ? '#38bdf8' : 'rgba(255,255,255,0.15)',
              width: i === currentQ ? '18px' : '7px',
            }} />
          ))}
        </div>
        <button
          style={{ ...styles.nextBtn, opacity: selected ? 1 : 0.4, cursor: selected ? 'pointer' : 'not-allowed' }}
          onClick={handleNext}
          disabled={!selected}
          onMouseEnter={e => { if (selected) e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)' }
        >
          {currentQ + 1 === questions.length ? 'Submit →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #050d1a 0%, #071524 60%, #050d12 100%)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', top: '-150px', left: '-150px', pointerEvents: 'none' },
  orb2: { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,132,199,0.08) 0%, transparent 70%)', bottom: '-100px', right: '-100px', pointerEvents: 'none' },

  topbar: { position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 },
  backLink: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  topbarLogo: { display: 'flex', alignItems: 'center', gap: '8px' },
  topbarLogoIcon: { width: '28px', height: '28px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' },
  topbarLogoText: { color: '#fff', fontSize: '13px', fontWeight: '700' },
  exitBtn: { fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 14px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit' },

  hero: { position: 'relative', zIndex: 5, padding: '2.5rem 2rem 1rem' },
  heroMeta: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' },
  moduleTag: { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8', fontSize: '11px', fontWeight: '700', padding: '4px 14px', borderRadius: '20px' },
  qCounter: { fontSize: '12px', color: 'rgba(255,255,255,0.3)' },
  question: { color: '#fff', fontSize: '22px', fontWeight: '800', lineHeight: '1.4', letterSpacing: '-0.5px', marginBottom: '1.25rem', maxWidth: '700px' },
  progressTrack: { height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', maxWidth: '700px' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', borderRadius: '4px', transition: 'width 0.4s ease' },

  optionsGrid: { position: 'relative', zIndex: 5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '1rem 2rem', flex: 1 },
  option: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' },
  optionSelected: { background: 'rgba(14,165,233,0.12)', borderColor: 'rgba(14,165,233,0.4)', transform: 'translateY(-2px)' },
  optKey: { width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', flexShrink: 0 },
  optKeySelected: { background: 'rgba(14,165,233,0.25)', borderColor: 'rgba(14,165,233,0.5)', color: '#38bdf8' },
  optText: { fontSize: '14px', lineHeight: '1.5', transition: 'color 0.2s' },

  bottomBar: { position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderTop: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 },
  dots: { display: 'flex', gap: '5px', alignItems: 'center' },
  dot: { height: '7px', borderRadius: '4px', transition: 'all 0.3s' },
  nextBtn: { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', border: 'none', padding: '11px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', transition: 'all 0.2s', fontFamily: 'inherit' },

  loadPage: { minHeight: '100vh', background: 'linear-gradient(135deg, #050d1a, #071524)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
  loadIcon: { fontSize: '48px' },
  loadText: { color: 'rgba(255,255,255,0.4)', fontSize: '14px' },
  backBtn: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '0.5rem' },

  resultWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 5 },
  resultCard: { width: '100%', maxWidth: '560px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(32px)', border: '1px solid', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' },
  resultIcon: { fontSize: '48px', textAlign: 'center', marginBottom: '0.75rem' },
  resultScore: { textAlign: 'center', marginBottom: '0.5rem' },
  scoreNum: { fontSize: '52px', fontWeight: '800', letterSpacing: '-2px' },
  resultTitle: { color: '#fff', fontSize: '22px', fontWeight: '800', textAlign: 'center', marginBottom: '8px', letterSpacing: '-0.5px' },
  resultSub: { color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center', lineHeight: '1.6', marginBottom: '1.5rem' },
  badgeEarned: { display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: '14px', padding: '14px 18px', marginBottom: '1.5rem' },
  badgeEarnedIcon: { fontSize: '32px', flexShrink: 0 },
  badgeEarnedTitle: { color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '3px' },
  badgeEarnedSub: { color: '#38bdf8', fontSize: '12px' },
  resultReview: { marginBottom: '1.5rem' },
  reviewTitle: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' },
  reviewRow: { border: '1px solid', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px' },
  reviewQ: { color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '4px', lineHeight: '1.5' },
  reviewStatus: { fontSize: '12px', fontWeight: '600' },
  resultBtns: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  btnPrimary: { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 22px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' },
  btnRetry: { background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.25)', padding: '11px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
}