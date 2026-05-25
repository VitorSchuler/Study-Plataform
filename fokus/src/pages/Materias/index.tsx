import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, User, Sparkles, X, BookOpen } from 'lucide-react'
import styles from './Materias.module.css'

interface Subject {
  id: number
  name: string
  professor: string
  studyMethod: string
}

export default function Materias() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: 1,
      name: 'Estrutura de Dados',
      professor: 'Dr. Arthur Lenner',
      studyMethod: 'Foco total em resoluções de problemas em C++ e análise assintótica. Prefiro resumos curtos seguidos de exercícios práticos.'
    },
    {
      id: 2,
      name: 'Programação Web',
      professor: 'Demetrio Gomes Mestre',
      studyMethod: 'Abordagem brutalista e moderna de CSS. Foco em componentização no React e boas práticas de arquitetura limpa.'
    }
  ])

  const [name, setName] = useState('')
  const [professor, setProfessor] = useState('')
  const [studyMethod, setStudyMethod] = useState('')

  function handleCreateSubject(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !studyMethod.trim()) return

    const newSubject: Subject = {
      id: Date.now(),
      name,
      professor: professor.trim() ? professor : 'Não informado',
      studyMethod
    }

    setSubjects([...subjects, newSubject])
    
    // Limpar formulário e fechar modal
    setName('')
    setProfessor('')
    setStudyMethod('')
    setIsModalOpen(false)
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
        {subjects.map(subject => (
          <article key={subject.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <BookOpen size={20} className={styles.subjectIcon} />
              <h3 className={styles.subjectName}>{subject.name}</h3>
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
              <p>{subject.studyMethod}</p>
            </div>

            {/* Substituído o <button> pelo <Link> do React Router */}
            <Link 
              to={`/materias/${subject.id}`} 
              className={styles.enterBtn}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              Acessar Disciplina
            </Link>
          </article>
        ))}
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
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={styles.input}
                  required
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
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Como você quer estudar essa matéria?</label>
                
                {/* Textinho explicativo sobre o Modus Operandi */}
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
                  placeholder="Ex: Quero focar em memorização ativa. Peça para a IA gerar flashcards e focar na resolução de equações passo a passo, sem me dar a resposta direto..."
                  value={studyMethod}
                  onChange={e => setStudyMethod(e.target.value)}
                  className={styles.textarea}
                  rows={5}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Salvar Disciplina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}