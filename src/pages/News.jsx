import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const FEEDS = [
  { label: 'The Hacker News',  url: 'https://thehackernews.com/feeds/posts/default' },
  { label: 'Bleeping Computer', url: 'https://www.bleepingcomputer.com/feed/' },
]

const CAT_COLORS = {
  malware:       { bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)',    text: '#fca5a5' },
  phishing:      { bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.25)',   text: '#fdba74' },
  vulnerability: { bg: 'rgba(234,179,8,0.1)',    border: 'rgba(234,179,8,0.25)',    text: '#fde047' },
  data:          { bg: 'rgba(14,165,233,0.1)',   border: 'rgba(14,165,233,0.25)',   text: '#38bdf8' },
  ransomware:    { bg: 'rgba(168,85,247,0.1)',   border: 'rgba(168,85,247,0.25)',   text: '#d8b4fe' },
  default:       { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)',   text: '#94a3b8' },
}

const CAT_ICONS = { malware: '🦠', phishing: '🎣', vulnerability: '⚠️', data: '💾', ransomware: '💀' }

function getCategory(title, desc) {
  const t = ((title || '') + (desc || '')).toLowerCase()
  if (t.includes('phish'))                             return 'phishing'
  if (t.includes('ransomware'))                        return 'ransomware'
  if (t.includes('malware') || t.includes('virus'))    return 'malware'
  if (t.includes('vulnerab') || t.includes('patch'))   return 'vulnerability'
  if (t.includes('breach') || t.includes('leak') || t.includes('data')) return 'data'
  return 'default'
}

function getCatLabel(cat) {
  if (cat === 'default') return '🔐 Security'
  return CAT_ICONS[cat] + ' ' + cat.charAt(0).toUpperCase() + cat.slice(1)
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return diff + 's ago'
  if (diff < 3600)  return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
}

function parseRSS(xmlText) {
  const parser = new DOMParser()
  const xml    = parser.parseFromString(xmlText, 'text/xml')
  const items  = Array.from(xml.querySelectorAll('item'))
  return items.map(function(item) {
    const get = function(tag) {
      const el = item.querySelector(tag)
      return el ? el.textContent.trim() : ''
    }
    let thumbnail = ''
    const media = item.querySelector('content') || item.querySelector('thumbnail')
    if (media) thumbnail = media.getAttribute('url') || ''
    if (!thumbnail) {
      const enc = item.querySelector('enclosure')
      if (enc && enc.getAttribute('type') && enc.getAttribute('type').startsWith('image')) {
        thumbnail = enc.getAttribute('url') || ''
      }
    }
    if (!thumbnail) {
      const match = get('description').match(/<img[^>]+src=["']([^"']+)["']/)
      if (match) thumbnail = match[1]
    }
    return {
      title:       get('title'),
      link:        get('link'),
      pubDate:     get('pubDate'),
      description: get('description'),
      thumbnail:   thumbnail,
    }
  })
}

// ── Extracted card component so the map stays simple ──────────────────────────
function ArticleCard(props) {
  const article    = props.article
  const feedLabel  = props.feedLabel
  const lang       = props.lang
  const cat        = getCategory(article.title, article.description)
  const col        = CAT_COLORS[cat]
  const desc       = stripHtml(article.description).substring(0, 160)

  function onEnter(e) {
    e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)'
    e.currentTarget.style.transform   = 'translateY(-4px)'
    e.currentTarget.style.boxShadow   = '0 16px 40px rgba(14,165,233,0.1)'
  }
  function onLeave(e) {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
    e.currentTarget.style.transform   = 'translateY(0)'
    e.currentTarget.style.boxShadow   = '0 8px 24px rgba(0,0,0,0.2)'
  }

  const pillStyle = {
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
    background: col.bg,
    border: '1px solid ' + col.border,
    color: col.text,
  }

  return (
    <a href={article.link} target="_blank" rel="noopener noreferrer" style={styles.cardLink}>
      <div style={styles.card} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <div style={styles.cardTop}>
          <span style={pillStyle}>{getCatLabel(cat)}</span>
          <span style={styles.timeAgo}>{article.pubDate ? timeAgo(article.pubDate) : ''}</span>
        </div>
        {article.thumbnail ? (
          <img
            src={article.thumbnail}
            alt=""
            style={styles.thumb}
            onError={function(e) { e.target.style.display = 'none' }}
          />
        ) : null}
        <div style={styles.cardTitle}>{article.title}</div>
        {desc ? <div style={styles.cardDesc}>{desc + '...'}</div> : null}
        <div style={styles.cardFooter}>
          <span style={styles.source}>{feedLabel}</span>
          <span style={styles.readMore}>
            {lang === 'en' ? 'Read full article →' : 'Ridim ful atikel →'}
          </span>
        </div>
      </div>
    </a>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function News() {
  const [isAdmin, setIsAdmin]       = useState(false)
  const [lang, setLang]             = useState('en')
  const [articles, setArticles]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [activeFeed, setActiveFeed] = useState(0)
  const [search, setSearch]         = useState('')
  const [tick, setTick]             = useState(0)
  const navigate = useNavigate()

  useEffect(function() {
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { navigate('/login'); return }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      if (profile && profile.role === 'admin') setIsAdmin(true)
    }
    init()
  }, [])

  useEffect(function() {
    async function fetchFeed() {
      setLoading(true)
      setError(false)
      setArticles([])
      try {
        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(FEEDS[activeFeed].url)
        const res      = await fetch(proxyUrl)
        if (!res.ok) throw new Error('Network error')
        const text     = await res.text()
        const parsed   = parseRSS(text)
        if (parsed.length === 0) throw new Error('Empty feed')
        setArticles(parsed)
      } catch (err) {
        console.error('Feed error:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [activeFeed, tick])

  const filtered = articles.filter(function(a) {
    if (search === '') return true
    const q = search.toLowerCase()
    return a.title.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
  })

  function handleTabClick(i) {
    setActiveFeed(i)
    setSearch('')
  }

  function handleRetry() {
    setTick(function(t) { return t + 1 })
  }

  return (
    <div style={styles.layout}>
      <Sidebar lang={lang} setLang={setLang} isAdmin={isAdmin} />
      <div style={styles.main}>
        <Topbar title="Cybersecurity News" alertCount={2} />
        <div style={styles.content}>

          <div style={styles.header}>
            <div style={styles.eyebrow}>
              <span style={styles.eyebrowLine} />
              {lang === 'en' ? 'Live feed · Updated automatically' : 'Laip fiid · Apdetim otomatik'}
            </div>
            <h1 style={styles.title}>
              {lang === 'en' ? 'Latest Cybersecurity News' : 'Nupela Nius long Cybersecurity'}
            </h1>
            <p style={styles.sub}>
              {lang === 'en'
                ? 'Stay informed with the latest global cybersecurity threats, breaches, and updates.'
                : 'Harim nupela nius long ol bagarap na updet long cybersecurity long graun hol.'}
            </p>
          </div>

          <div style={styles.toolbar}>
            <div style={styles.tabs}>
              {FEEDS.map(function(f, i) {
                return (
                  <button
                    key={i}
                    style={activeFeed === i ? { ...styles.tab, ...styles.tabActive } : styles.tab}
                    onClick={function() { handleTabClick(i) }}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
            <input
              style={styles.search}
              placeholder={lang === 'en' ? '🔍  Search articles...' : '🔍  Setsim atikel...'}
              value={search}
              onChange={function(e) { setSearch(e.target.value) }}
            />
          </div>

          {loading && (
            <div style={styles.center}>
              <div style={styles.spinner} />
              <div style={styles.loadText}>
                {lang === 'en' ? 'Fetching latest news...' : 'Kisim nupela nius...'}
              </div>
            </div>
          )}

          {!loading && error && (
            <div style={styles.center}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📡</div>
              <div style={styles.errorTitle}>
                {lang === 'en' ? 'Could not load news feed' : 'I no inap kisim nius fiid'}
              </div>
              <div style={styles.errorSub}>
                {lang === 'en'
                  ? 'Check your internet connection and try again.'
                  : 'Lukim net koneksion na traim gen.'}
              </div>
              <button style={styles.retryBtn} onClick={handleRetry}>
                {lang === 'en' ? 'Retry' : 'Traim Gen'}
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={styles.center}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
              <div style={styles.errorTitle}>
                {lang === 'en' ? 'No results found' : 'Nogat ripot'}
              </div>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div style={styles.grid}>
              {filtered.map(function(article, i) {
                return (
                  <ArticleCard
                    key={i}
                    article={article}
                    feedLabel={FEEDS[activeFeed].label}
                    lang={lang}
                  />
                )
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

const styles = {
  layout:      { display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #050d1a 0%, #071524 60%, #050d12 100%)' },
  main:        { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  content:     { padding: '1.5rem 1.25rem', flex: 1 },
  header:      { marginBottom: '1.5rem', animation: 'fadeUp 0.6s ease both' },
  eyebrow:     { fontSize: '10px', fontWeight: '700', color: 'rgba(14,165,233,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' },
  eyebrowLine: { display: 'inline-block', width: '18px', height: '2px', background: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', borderRadius: '2px' },
  title:       { color: '#fff', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.6px', marginBottom: '6px' },
  sub:         { color: 'rgba(255,255,255,0.35)', fontSize: '13px', lineHeight: '1.6' },
  toolbar:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '12px', flexWrap: 'wrap' },
  tabs:        { display: 'flex', gap: '6px' },
  tab:         { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' },
  tabActive:   { background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', color: '#38bdf8' },
  search:      { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '12px', fontFamily: 'inherit', outline: 'none', width: '220px' },
  center:      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '10px' },
  spinner:     { width: '36px', height: '36px', border: '3px solid rgba(14,165,233,0.15)', borderTop: '3px solid #0ea5e9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadText:    { color: 'rgba(255,255,255,0.3)', fontSize: '13px' },
  errorTitle:  { color: '#fff', fontSize: '16px', fontWeight: '700' },
  errorSub:    { color: 'rgba(255,255,255,0.3)', fontSize: '12px' },
  retryBtn:    { marginTop: '8px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', color: '#38bdf8', padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', animation: 'fadeUp 0.5s ease both' },
  cardLink:    { textDecoration: 'none' },
  card:        { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  timeAgo:     { fontSize: '10px', color: 'rgba(255,255,255,0.25)' },
  thumb:       { width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px' },
  cardTitle:   { color: '#fff', fontSize: '13px', fontWeight: '700', lineHeight: '1.5', letterSpacing: '-0.2px' },
  cardDesc:    { color: 'rgba(255,255,255,0.35)', fontSize: '11px', lineHeight: '1.65', flex: 1 },
  cardFooter:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: 'auto' },
  source:      { fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: '600' },
  readMore:    { fontSize: '10px', color: '#0ea5e9', fontWeight: '600' },
}