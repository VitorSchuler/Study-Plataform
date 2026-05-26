import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

import { DashboardHeader } from './components/DashboardHeader'
import { StatsGrid } from './components/StatsGrid'
import { ExamsTimeline, type Prova } from './components/ExamsTimeline'

import styles from './Home.module.css'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('Estudante')
  const [saudacao, setSaudacao] = useState('')
  
  const [stats, setStats] = useState({ materias: 0, resumos: 0, provas: 0 })
  const [proximasProvas, setProximasProvas] = useState<Prova[]>([])

  useEffect(() => {
    definirSaudacao()
    fetchDashboardData()
  }, [])

  function definirSaudacao() {
    const hora = new Date().getHours()
    if (hora < 12) setSaudacao('Bom dia')
    else if (hora < 18) setSaudacao('Boa tarde')
    else setSaudacao('Boa noite')
  }

  async function fetchDashboardData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const nomeCompleto = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Estudante'
      setUserName(nomeCompleto.split(' ')[0])

      const { count: countMat } = await supabase.from('materias').select('*', { count: 'exact', head: true })
      const { count: countDocs } = await supabase.from('documentos').select('*', { count: 'exact', head: true })
      const { count: countAnot } = await supabase.from('anotacoes').select('*', { count: 'exact', head: true })
      
      const totalResumos = (countDocs || 0) + (countAnot || 0)

      // A QUERY CORRIGIDA:
      const { data: provasData, error: provasError } = await supabase
        .from('provas')
        .select(`id, nome, data_prova, materias (nome)`)
        .order('data_prova', { ascending: true })
        .limit(4)

      if (provasError) {
        console.error('Erro ao buscar provas:', provasError.message)
      }

      // Filtro de segurança manual: pega apenas datas de hoje em diante
      const hoje = new Date().toISOString().split('T')[0]
      const provasFiltradas = provasData?.filter(p => p.data_prova >= hoje) || []

      setStats({
        materias: countMat || 0,
        resumos: totalResumos,
        provas: provasFiltradas.length
      })

      if (provasData) {
        setProximasProvas(provasData as unknown as Prova[])
      }
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <DashboardHeader saudacao={saudacao} userName={userName} />
      
      <StatsGrid stats={stats} />

      <div className={styles.mainContent}>
        <ExamsTimeline proximasProvas={proximasProvas} />
      </div>
    </div>
  )
}