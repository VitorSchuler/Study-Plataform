import { useState, useRef, useEffect } from 'react'
import { Plus, Paperclip, Trash2, File, Download, Image as ImageIcon, Presentation, FileSpreadsheet, FileText, AlignLeft, Loader2, Eye, X } from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import styles from '../Disciplina.module.css'

interface DocumentItem { id: string; title: string; fileName: string; fileSize: string; filePath: string; date: string; tipo: string }
interface AnotacaoItem { id: string; titulo: string; conteudo: string; date: string }

interface GerenciadorDocsProps {
  materiaId: string
  activeTab: 'resumos' | 'materiais'
}

export function GerenciadorDocs({ materiaId, activeTab }: GerenciadorDocsProps) {
  const [documentos, setDocumentos] = useState<DocumentItem[]>([])
  const [isAddingDoc, setIsAddingDoc] = useState(false)
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [anotacoes, setAnotacoes] = useState<AnotacaoItem[]>([])
  const [isAddingAnotacao, setIsAddingAnotacao] = useState(false)
  const [editingAnotacaoId, setEditingAnotacaoId] = useState<string | null>(null)
  const [tituloAnotacao, setTituloAnotacao] = useState('')
  const [conteudoAnotacao, setConteudoAnotacao] = useState('')
  const [viewingAnotacao, setViewingAnotacao] = useState<AnotacaoItem | null>(null)

  useEffect(() => {
    fetchDocumentos()
    fetchAnotacoes()
  }, [materiaId])

  async function fetchDocumentos() {
    const { data } = await supabase.from('documentos').select('*').eq('materia_id', materiaId).order('created_at', { ascending: false })
    if (data) {
      setDocumentos(data.map(doc => ({
        id: doc.id, title: doc.titulo, fileName: doc.arquivo_nome, fileSize: doc.arquivo_tamanho,
        filePath: doc.arquivo_caminho, tipo: doc.tipo, date: new Date(doc.created_at).toLocaleDateString('pt-BR')
      })))
    }
  }

  async function fetchAnotacoes() {
    const { data } = await supabase.from('anotacoes').select('*').eq('materia_id', materiaId).order('created_at', { ascending: false })
    if (data) {
      setAnotacoes(data.map(a => ({
        id: a.id, titulo: a.titulo, conteudo: a.conteudo, date: new Date(a.created_at).toLocaleDateString('pt-BR')
      })))
    }
  }

  async function handleSaveDocument(e: React.FormEvent) {
    e.preventDefault()
    if (!newDocTitle.trim() || !selectedFile) return
    setIsUploadingDoc(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const fileExt = selectedFile.name.split('.').pop()
      const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${materiaId}/${safeFileName}`

      const { error: uploadError } = await supabase.storage.from('documentos').upload(filePath, selectedFile)
      if (!uploadError) {
        await supabase.from('documentos').insert([{
          user_id: user.id, materia_id: materiaId, tipo: activeTab, titulo: newDocTitle,
          arquivo_nome: selectedFile.name, arquivo_tamanho: formatFileSize(selectedFile.size), arquivo_caminho: filePath
        }])
        fetchDocumentos()
        setNewDocTitle('')
        setSelectedFile(null)
        setIsAddingDoc(false)
      }
    }
    setIsUploadingDoc(false)
  }

  async function handleSaveAnotacao(e: React.FormEvent) {
    e.preventDefault()
    if (!tituloAnotacao.trim() || !conteudoAnotacao.trim()) return
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      if (editingAnotacaoId) {
        await supabase.from('anotacoes').update({ titulo: tituloAnotacao, conteudo: conteudoAnotacao }).eq('id', editingAnotacaoId)
      } else {
        await supabase.from('anotacoes').insert([{ user_id: user.id, materia_id: materiaId, titulo: tituloAnotacao, conteudo: conteudoAnotacao }])
      }
      resetAnotacaoForm()
      fetchAnotacoes()
    }
  }

  function handleEditAnotacao(item: AnotacaoItem) {
    setIsAddingAnotacao(true)
    setEditingAnotacaoId(item.id)
    setTituloAnotacao(item.titulo)
    setConteudoAnotacao(item.conteudo)
  }

  async function handleDeleteDocument(docId: string, filePath: string) {
    if (!confirm('Deseja excluir este arquivo?')) return
    await supabase.storage.from('documentos').remove([filePath])
    await supabase.from('documentos').delete().eq('id', docId)
    fetchDocumentos()
  }

  async function handleDeleteAnotacao(anotId: string) {
    if (!confirm('Deseja excluir esta anotação?')) return
    await supabase.from('anotacoes').delete().eq('id', anotId)
    fetchAnotacoes()
  }

  function handleDownload(filePath: string) {
    const { data } = supabase.storage.from('documentos').getPublicUrl(filePath)
    window.open(data.publicUrl, '_blank')
  }

  function resetAnotacaoForm() {
    setIsAddingAnotacao(false)
    setEditingAnotacaoId(null)
    setTituloAnotacao('')
    setConteudoAnotacao('')
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  function getFileDetails(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return { icon: FileText, color: '#ef4444', label: 'PDF' }
      case 'png': case 'jpg': case 'jpeg': case 'gif': return { icon: ImageIcon, color: '#a855f7', label: 'IMG' }
      case 'ppt': case 'pptx': return { icon: Presentation, color: '#f97316', label: 'SLIDE' }
      case 'xls': case 'xlsx': case 'csv': return { icon: FileSpreadsheet, color: '#22c55e', label: 'PLANILHA' }
      default: return { icon: File, color: 'var(--brand-primary)', label: 'ARQUIVO' }
    }
  }

  const docsDaAba = documentos.filter(doc => doc.tipo === activeTab)

  return (
    <section className={styles.tabSection}>
      <div className={styles.sectionHeader}>
        <h2>{activeTab === 'resumos' ? 'Meus Resumos' : 'Materiais de Consulta'}</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {activeTab === 'resumos' && !isAddingAnotacao && !isAddingDoc && (
            <button className={styles.actionBtn} onClick={() => setIsAddingAnotacao(true)}><AlignLeft size={16} /> <span>Escrever Resumo</span></button>
          )}
          {!isAddingDoc && !isAddingAnotacao && (
            <button className={styles.actionBtn} onClick={() => setIsAddingDoc(true)}><Paperclip size={16} /> <span>{activeTab === 'resumos' ? 'Anexar Arquivo' : 'Adicionar Material'}</span></button>
          )}
        </div>
      </div>

      {isAddingDoc && (
        <form onSubmit={handleSaveDocument} className={styles.uploadCard}>
          <div className={styles.uploadFields}>
            <div className={styles.inputGroup}>
              <label className={styles.fieldLabel}>Título do arquivo</label>
              <input type="text" placeholder="Ex: Atlas de Anatomia..." value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} className={styles.docInput} required disabled={isUploadingDoc}/>
            </div>
            <div className={styles.fileDropzone} onClick={() => !isUploadingDoc && fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} onChange={e => e.target.files && setSelectedFile(e.target.files[0])} style={{ display: 'none' }} />
              {selectedFile ? (
                <div className={styles.fileSelectedInfo}>
                  <File size={24} className={styles.materialIcon} />
                  <div className={styles.fileDetails}>
                    <span className={styles.fileNameLabel}>{selectedFile.name}</span>
                    <span className={styles.fileSizeLabel}>{formatFileSize(selectedFile.size)}</span>
                  </div>
                </div>
              ) : (
                <div className={styles.dropzonePlaceholder}><Paperclip size={20} className={styles.iconMuted} /><span>Clique para anexar um arquivo</span></div>
              )}
            </div>
          </div>
          <div className={styles.uploadActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsAddingDoc(false)} disabled={isUploadingDoc}>Cancelar</button>
            <button type="submit" className={styles.submitBtn} disabled={!newDocTitle.trim() || !selectedFile || isUploadingDoc}>
              {isUploadingDoc ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Arquivo'}
            </button>
          </div>
        </form>
      )}

      {isAddingAnotacao && activeTab === 'resumos' && (
        <form onSubmit={handleSaveAnotacao} className={styles.uploadCard} style={{ gap: '1rem' }}>
          <div className={styles.inputGroup}>
            <label className={styles.fieldLabel}>Título da Anotação</label>
            <input type="text" placeholder="Ex: Resumo de Ossos..." value={tituloAnotacao} onChange={e => setTituloAnotacao(e.target.value)} className={styles.docInput} required />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.fieldLabel}>Conteúdo</label>
            <textarea placeholder="Cole o texto da IA aqui..." value={conteudoAnotacao} onChange={e => setConteudoAnotacao(e.target.value)} className={styles.docInput} style={{ minHeight: '160px', resize: 'vertical', paddingTop: '0.75rem' }} required />
          </div>
          <div className={styles.uploadActions}>
            <button type="button" className={styles.cancelBtn} onClick={resetAnotacaoForm}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>{editingAnotacaoId ? 'Atualizar' : 'Salvar'}</button>
          </div>
        </form>
      )}

      <div className={styles.documentList}>
        {docsDaAba.length === 0 && (activeTab !== 'resumos' || anotacoes.length === 0) ? (
          <div className={styles.placeholderArea}><p>Nenhum material salvo nesta seção.</p></div>
        ) : (
          <>
            {activeTab === 'resumos' && anotacoes.map(item => (
              <div key={item.id} className={styles.documentCard}>
                <div className={styles.docMainInfo}>
                  <div className={styles.docIconWrapper} style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}><AlignLeft size={24} /></div>
                  <div className={styles.docMeta}>
                    <div className={styles.docTitleRow}>
                      <h4 className={styles.docTitle}>{item.titulo}</h4>
                      <span className={styles.docTypeBadge} style={{ color: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)' }}>TEXTO</span>
                    </div>
                    <div className={styles.docSubMeta}><span>Salvo em: {item.date}</span></div>
                  </div>
                </div>
                <div className={styles.docActionGroup}>
                  <button type="button" className={styles.iconBtn} onClick={() => setViewingAnotacao(item)}><Eye size={18} /></button>
                  <div className={styles.verticalDivider}></div>
                  <button type="button" className={styles.iconBtn} onClick={() => handleEditAnotacao(item)}><FileText size={18} /></button>
                  <div className={styles.verticalDivider}></div>
                  <button type="button" className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteAnotacao(item.id)}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}

            {docsDaAba.map(item => {
              const fileInfo = getFileDetails(item.fileName)
              const FileIcon = fileInfo.icon
              return (
                <div key={item.id} className={styles.documentCard}>
                  <div className={styles.docMainInfo}>
                    <div className={styles.docIconWrapper} style={{ color: fileInfo.color, backgroundColor: `${fileInfo.color}15` }}><FileIcon size={24} /></div>
                    <div className={styles.docMeta}>
                      <div className={styles.docTitleRow}>
                        <h4 className={styles.docTitle}>{item.title}</h4>
                        <span className={styles.docTypeBadge} style={{ color: fileInfo.color, backgroundColor: `${fileInfo.color}10`, borderColor: `${fileInfo.color}30` }}>{fileInfo.label}</span>
                      </div>
                      <div className={styles.docSubMeta}>
                        <span className={styles.docFileName}>{item.fileName}</span>
                        <span className={styles.docDivider}>•</span>
                        <span className={styles.docSize}>{item.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.docActionGroup}>
                    <button type="button" className={styles.iconBtn} onClick={() => handleDownload(item.filePath)}><Download size={18} /></button>
                    <div className={styles.verticalDivider}></div>
                    <button type="button" className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteDocument(item.id, item.filePath)}><Trash2 size={18} /></button>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {viewingAnotacao && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '680px', width: '100%' }}>
            <div className={styles.modalHeader}><h2>{viewingAnotacao.titulo}</h2><button className={styles.closeBtn} onClick={() => setViewingAnotacao(null)}><X size={20} /></button></div>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', maxHeight: '50vh', overflowY: 'auto', whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {viewingAnotacao.conteudo}
            </div>
            <div className={styles.modalActions} style={{ marginTop: '1.5rem' }}>
              <button type="button" className={styles.cancelBtn} onClick={() => setViewingAnotacao(null)}>Fechar</button>
              <button type="button" className={styles.submitBtn} onClick={() => { handleEditAnotacao(viewingAnotacao); setViewingAnotacao(null); }}>Editar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}