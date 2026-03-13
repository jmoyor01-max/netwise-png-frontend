import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        navigate('/login')
      } else {
        setUser(data.user)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to NetWise PNG 🌏</h1>
        <p style={styles.subtitle}>Your cybersecurity awareness platform</p>
        {user && <p style={styles.email}>Logged in as: {user.email}</p>}
        <button style={styles.button} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center'
  },
  title: { color: '#2563eb', marginBottom: '8px' },
  subtitle: { color: '#6b7280', marginBottom: '16px' },
  email: { color: '#374151', marginBottom: '24px' },
  button: {
    padding: '12px 24px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  }
}