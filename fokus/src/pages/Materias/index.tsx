import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, User, Sparkles, X, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import styles from './Materias.module.css'

interface Subject {
  id: string
  nome: string
  professor: string
  modus_operandi: string
}

export default function Materias() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [nome, setNome] = useState('')
  const [professor, setProfessor] = useState('')
  const [modusOperandi, setModusOperandi] = useState('')

  // 1. Busca as matérias do usuário no Supabase
  async function fetchSubjects() {
    setLoading(true)
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSubjects(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  // 2. Salva a nova matéria no banco de dados
  async function handleCreateSubject(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !modusOperandi.trim()) return

    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('materias').insert([
        {
          nome,
          professor: professor.trim() ? professor : 'Não informado',
          modus_operandi: modusOperandi,
          user_id: user.id
        }
      ])

      if (!error) {
        // Limpar formulário, fechar modal e atualizar lista
        setNome('')
        setProfessor('')
        setModusOperandi('')
        setIsModalOpen(false)
        fetchSubjects()
      } else {
        alert('Erro ao salvar a matéria.')
      }
    }
    setIsSubmitting(false)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Minhas Matérias</h1>
          <p className={styles.subtitle}>Gerencie suas disciplinas e configure as diretrizes da IA.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Cadastrar Matéria</span>
        </button>
      </header>

      {/* Grid de Cards de Matérias */}
      <div className={styles.grid}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando matérias...</p>
        ) : subjects.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Nenhuma matéria cadastrada. Adicione sua primeira!</p>
        ) : (
          subjects.map(subject => (
            <article key={subject.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <BookOpen size={20} className={styles.subjectIcon} />
                <h3 className={styles.subjectName}>{subject.nome}</h3>
              </div>
              
              <div className={styles.professorInfo}>
                <User size={14} />
                <span>{subject.professor}</span>
              </div>

              <div className={styles.methodPreview}>
                <div className={styles.methodHeader}>
                  <Sparkles size={14} className={styles.sparkleIcon} />
                  <span>Diretriz da IA</span>
                </div>
                <p>{subject.modus_operandi}</p>
              </div>

              <Link 
                to={`/materias/${subject.id}`} 
                className={styles.enterBtn}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
              >
                Acessar Disciplina
              </Link>
            </article>
          ))
        )}
      </div>

      {/* Modal de Cadastro (Sobreposição) */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Nova Matéria</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nome da disciplina</label>
                <input
                  type="text"
                  placeholder="Ex: Cálculo B, Redes de Computadores..."
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className={styles.input}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Nome do professor</label>
                <input
                  type="text"
                  placeholder="Ex: Dr. João Silva"
                  value={professor}
                  onChange={e => setProfessor(e.target.value)}
                  className={styles.input}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Como você quer estudar essa matéria?</label>
                <div className={styles.aiExplanation}>
                  <Sparkles size={16} className={styles.explanationIcon} />
                  <p>
                    <strong>Modus Operandi da IA:</strong> Este campo define o comportamento do sistema. 
                    Explique à IA como você deseja aprender (ex: focado em lógica e código, explicações teóricas densas, 
                    método baseado em perguntas e respostas). Esta descrição será injetada como o 
                    <em> prompt inicial</em> de contexto para moldar todas as interações e resumos futuros desta matéria.
                  </p>
                </div>

                <textarea
                  placeholder="Ex: Quero focar em memorização ativa. Peça para a IA gerar flashcards e focar na resolução de equações passo a passo..."
                  value={modusOperandi}
                  onChange={e => setModusOperandi(e.target.value)}
                  className={styles.textarea}
                  rows={5}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Disciplina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}