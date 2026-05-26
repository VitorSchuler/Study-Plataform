import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, MessageSquare, FileText, Library, Calendar } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

// Importação dos Componentes Modulares Filtrados
import { ChatArena } from './components/ChatArena'
import { GerenciadorDocs } from './components/GerenciadorDocs'
import { GestorProvas } from './components/GestorProvas'
import { PainelLateral } from './components/PainelLateral'

import styles from './Disciplina.module.css'

type Tab = 'ia' | 'resumos' | 'materiais' | 'provas'

export default function Disciplina() {
  const { id } = useParams<{ id: string }>() 
  const [activeTab, setActiveTab] = useState<Tab>('ia')
  const [materia, setMateria] = useState<{ nome: string; modus_operandi: string } | null>(null)

  useEffect(() => {
    async function fetchMateria() {
      if (!id) return
      const { data } = await supabase.from('materias').select('nome, modus_operandi').eq('id', id).single()
      if (data) setMateria(data)
    }
    fetchMateria()
  }, [id])

  if (!id) return null

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <Link to="/materias" className={styles.backBtn}><ChevronLeft size={20} /><span>Voltar para Matérias</span></Link>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>{materia ? materia.nome : 'Carregando...'}</h1>
            <span className={styles.badge}>Modus Operandi Ativo</span>
          </div>
        </div>

        <nav className={styles.tabNav}>
          <button className={`${styles.tabBtn} ${activeTab === 'ia' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('ia')}><MessageSquare size={16} /> Estudo Integrado (IA)</button>
          <button className={`${styles.tabBtn} ${activeTab === 'resumos' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('resumos')}><FileText size={16} /> Resumos</button>
          <button className={`${styles.tabBtn} ${activeTab === 'materiais' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('materiais')}><Library size={16} /> Materiais</button>
          <button className={`${styles.tabBtn} ${activeTab === 'provas' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('provas')}><Calendar size={16} /> Datas de Prova</button>
        </nav>
      </header>

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          {activeTab === 'ia' && (
            <ChatArena materiaNome={materia?.nome} materiaModusOperandi={materia?.modus_operandi} />
          )}

          {(activeTab === 'resumos' || activeTab === 'materiais') && (
            <GerenciadorDocs materiaId={id} activeTab={activeTab} />
          )}

          {activeTab === 'provas' && (
            <GestorProvas materiaId={id} />
          )}
        </div>

        {/* Painel Estratégico Lateral Direito Fixo */}
        <PainelLateral materiaId={id} />
      </div>
    </div>
  )
}