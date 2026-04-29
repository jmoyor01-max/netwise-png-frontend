import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useQuiz(moduleId) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!moduleId) return
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('module_id', parseInt(moduleId))
      if (error) { setError(error.message); setLoading(false); return }
      setQuestions(data || [])
      setLoading(false)
    }
    fetchQuestions()
  }, [moduleId])

  return { questions, loading, error }
}