import { useState, useEffect } from 'react'
import { Plus, Calendar, Trash2, Edit2 } from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import styles from '../Disciplina.module.css'

interface ProvaItem { id: string; nome: string; data_prova: string; data_raw: string }

interface GestorProvasProps {
  materiaId: string
}

export function GestorProvas({ materiaId }: GestorProvasProps) {
  const [provas, setProvas] = useState<ProvaItem[]>([])
  const [isAddingProva, setIsAddingProva] = useState(false)
  const [editingProvaId, setEditingProvaId] = useState<string | null>(null)
  const [nomeProva, setNomeProva] = useState('')
  const [dataProva, setDataProva] = useState('')

  useEffect(() => {
    fetchProvas()
  }, [materiaId])

  async function fetchProvas() {
    const { data } = await supabase.from('provas').select('*').eq('materia_id', materiaId).order('data_prova', { ascending: true })
    if (data) {
      setProvas(data.map(p => ({
        id: p.id, nome: p.nome,
        data_prova: new Date(p.data_prova).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        data_raw: p.data_prova
      })))
    }
  }

  async function handleSaveProva(e: React.FormEvent) {
    e.preventDefault()
    if (!nomeProva.trim() || !dataProva) return
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      if (editingProvaId) {
        await supabase.from('provas').update({ nome: nomeProva, data_prova: dataProva }).eq('id', editingProvaId)
      } else {
        await supabase.from('provas').insert([{ user_id: user.id, materia_id: materiaId, nome: nomeProva, data_prova: dataProva }])
      }
      resetProvaForm()
      fetchProvas()
    }
  }

  function handleEditProva(item: ProvaItem) {
    setIsAddingProva(true)
    setEditingProvaId(item.id)
    setNomeProva(item.nome)
    setDataProva(item.data_raw)
  }

  async function handleDeleteProva(provaId: string) {
    if (!confirm('Deseja remover esta avaliação?')) return
    await supabase.from('provas').delete().eq('id', provaId)
    fetchProvas()
  }

  function resetProvaForm() {
    setIsAddingProva(false)
    setEditingProvaId(null)
    setNomeProva('')
    setDataProva('')
  }

  return (
    <section className={styles.tabSection}>
      <div className={styles.sectionHeader}>
        <h2>Calendário de Avaliações</h2>
        {!isAddingProva && (
          <button className={styles.actionBtn} onClick={() => setIsAddingProva(true)}><Plus size={16} /> Agendar Prova</button>
        )}
      </div>

      {isAddingProva && (
        <form onSubmit={handleSaveProva} className={styles.uploadCard}>
          <div className={styles.uploadFields}>
            <div className={styles.inputGroup}>
              <label className={styles.fieldLabel}>Identificação da Avaliação</label>
              <input type="text" placeholder="Ex: Prova Prática 1..." value={nomeProva} onChange={e => setNomeProva(e.target.value)} className={styles.docInput} required />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.fieldLabel}>Data da Avaliação</label>
              <input type="date" value={dataProva} onChange={e => setDataProva(e.target.value)} className={styles.docInput} required />
            </div>
          </div>
          <div className={styles.uploadActions}>
            <button type="button" className={styles.cancelBtn} onClick={resetProvaForm}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>{editingProvaId ? 'Atualizar Prova' : 'Agendar'}</button>
          </div>
        </form>
      )}

      <div className={styles.documentList}>
        {provas.length === 0 ? (
          <div className={styles.placeholderArea}><p>Nenhuma prova agendada para esta matéria.</p></div>
        ) : (
          provas.map(item => (
            <div key={item.id} className={styles.documentCard}>
              <div className={styles.docMainInfo}>
                <div className={styles.docIconWrapper} style={{ color: 'var(--brand-primary)', backgroundColor: 'rgba(167, 139, 255, 0.1)' }}><Calendar size={24} /></div>
                <div className={styles.docMeta}>
                  <h4 className={styles.docTitle}>{item.nome}</h4>
                  <div className={styles.docSubMeta}><span>Data fixada: {item.data_prova}</span></div>
                </div>
              </div>
              <div className={styles.docActionGroup}>
                <button type="button" className={styles.iconBtn} onClick={() => handleEditProva(item)}><Edit2 size={18} /></button>
                <div className={styles.verticalDivider}></div>
                <button type="button" className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteProva(item.id)}><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}