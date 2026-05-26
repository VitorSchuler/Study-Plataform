import { useState, useEffect } from 'react'
import { Plus, X, Link2, ExternalLink, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import { Pomodoro } from '../../../../components/Pomodoro'
import styles from '../Disciplina.module.css'

interface LinkItem { id: string; titulo: string; url: string }

interface PainelLateralProps {
  materiaId: string
}

export function PainelLateral({ materiaId }: PainelLateralProps) {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [tituloLink, setTituloLink] = useState('')
  const [urlLink, setUrlLink] = useState('')

  useEffect(() => {
    fetchLinks()
  }, [materiaId])

  async function fetchLinks() {
    const { data } = await supabase.from('links_importantes').select('*').eq('materia_id', materiaId).order('created_at', { ascending: true })
    if (data) setLinks(data.map(l => ({ id: l.id, titulo: l.titulo, url: l.url })))
  }

  async function handleSaveLink(e: React.FormEvent) {
    e.preventDefault()
    if (!tituloLink.trim() || !urlLink.trim()) return
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      let formattedUrl = urlLink.trim()
      if (!/^https?:\/\//i.test(formattedUrl)) formattedUrl = `https://${formattedUrl}`

      if (editingLinkId) {
        await supabase.from('links_importantes').update({ titulo: tituloLink, url: formattedUrl }).eq('id', editingLinkId)
      } else {
        await supabase.from('links_importantes').insert([{ user_id: user.id, materia_id: materiaId, titulo: tituloLink, url: formattedUrl }])
      }
      resetLinkForm()
      fetchLinks()
    }
  }

  function handleEditLink(item: LinkItem) {
    setIsAddingLink(true)
    setEditingLinkId(item.id)
    setTituloLink(item.titulo)
    setUrlLink(item.url)
  }

  async function handleDeleteLink(linkId: string) {
    if (!confirm('Deseja remover este link?')) return
    await supabase.from('links_importantes').delete().eq('id', linkId)
    fetchLinks()
  }

  function resetLinkForm() {
    setIsAddingLink(false)
    setEditingLinkId(null)
    setTituloLink('')
    setUrlLink('')
  }

  return (
    <aside className={styles.sidePanel}>
      <div className={styles.toolCard}>
        <div className={styles.cardHeader}><h2>Modo Foco</h2></div>
        <div className={styles.pomodoroWrapper}><Pomodoro /></div>
      </div>

      <div className={styles.toolCard}>
        <div className={`${styles.cardHeader} ${styles.cardHeaderWithAction}`}>
          <h2>Links Importantes</h2>
          <button className={styles.addLinkBtn} onClick={() => { if(isAddingLink) resetLinkForm(); else setIsAddingLink(true); }}>
            {isAddingLink ? <X size={14} /> : <Plus size={14} />}
          </button>
        </div>
        
        {isAddingLink && (
          <form onSubmit={handleSaveLink} className={styles.form} style={{ marginBottom: '1rem', gap: '0.75rem' }}>
            <input type="text" placeholder="Título (Ex: GitHub...)" value={tituloLink} onChange={e => setTituloLink(e.target.value)} className={styles.docInput} style={{ height: '36px', fontSize: '0.85rem' }} required />
            <input type="text" placeholder="URL (ex: google.com)" value={urlLink} onChange={e => setUrlLink(e.target.value)} className={styles.docInput} style={{ height: '36px', fontSize: '0.85rem' }} required />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {editingLinkId && <button type="button" className={styles.cancelBtn} style={{ flex: 1, height: '32px', padding: 0 }} onClick={resetLinkForm}>Cancelar</button>}
              <button type="submit" className={styles.submitBtn} style={{ flex: 1, height: '32px', fontSize: '0.8rem' }}>{editingLinkId ? 'Atualizar' : 'Adicionar'}</button>
            </div>
          </form>
        )}

        <div className={styles.linksList}>
          {links.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>Nenhum link salvo.</p>
          ) : (
            links.map(item => (
              <div key={item.id} className={styles.linkItem} style={{ position: 'relative', justifyContent: 'space-between', paddingRight: '4rem' }}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flex: 1, minWidth: 0 }}>
                  <div className={styles.linkIconWrapper}><Link2 size={14} /></div>
                  <span className={styles.linkText}>{item.titulo}</span>
                  <ExternalLink size={12} className={styles.externalIcon} />
                </a>
                <div style={{ position: 'absolute', right: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => handleEditLink(item)} className={styles.iconBtn} style={{ padding: '0.25rem', opacity: 0.6 }}><Edit2 size={12} /></button>
                  <button onClick={() => handleDeleteLink(item.id)} className={styles.iconBtn} style={{ padding: '0.25rem', opacity: 0.6 }}><Trash2 size={12} style={{ color: '#ef4444' }} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  )
}