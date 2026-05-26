import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ChevronLeft, Send, Sparkles, FileText, BrainCircuit, 
  MessageSquare, Library, Calendar, Plus, Paperclip, 
  Trash2, File, Download, Image as ImageIcon, Presentation, 
  FileSpreadsheet, ExternalLink, Link2, Loader2
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { Pomodoro } from '../../../components/Pomodoro'
import styles from './Disciplina.module.css'

type Tab = 'ia' | 'resumos' | 'materiais' | 'provas'

interface DocumentItem {
  id: string
  title: string
  fileName: string
  fileSize: string
  filePath: string
  date: string
  tipo: string
}

export default function Disciplina() {
  const { id } = useParams<{ id: string }>() 
  const [activeTab, setActiveTab] = useState<Tab>('ia')
  
  const [materia, setMateria] = useState<{ nome: string, modus_operandi: string } | null>(null)
  
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([{ role: 'system', content: 'Carregando diretrizes...' }])

  // Estados dos Arquivos
  const [documentos, setDocumentos] = useState<DocumentItem[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Busca a Matéria e os Documentos
  useEffect(() => {
    async function fetchData() {
      if (!id) return
      
      // Busca a matéria
      const { data: matData } = await supabase
        .from('materias')
        .select('nome, modus_operandi')
        .eq('id', id)
        .single()

      if (matData) {
        setMateria(matData)
        setMessages([
          { role: 'system', content: `Olá! Sou seu assistente focado em ${matData.nome}. Modus operandi: "${matData.modus_operandi}". Como vamos começar hoje?` }
        ])
      }

      // Busca os documentos
      fetchDocumentos()
    }
    fetchData()
  }, [id])

  async function fetchDocumentos() {
    if (!id) return
    const { data } = await supabase
      .from('documentos')
      .select('*')
      .eq('materia_id', id)
      .order('created_at', { ascending: false })

    if (data) {
      const docsFormatados = data.map(doc => ({
        id: doc.id,
        title: doc.titulo,
        fileName: doc.arquivo_nome,
        fileSize: doc.arquivo_tamanho,
        filePath: doc.arquivo_caminho,
        tipo: doc.tipo,
        date: new Date(doc.created_at).toLocaleDateString('pt-BR')
      }))
      setDocumentos(docsFormatados)
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  // 2. Faz o Upload físico e salva no banco
  async function handleSaveDocument(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !selectedFile || !id) return

    setIsUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Cria um nome de arquivo único para não sobrescrever na nuvem
      const fileExt = selectedFile.name.split('.').pop()
      const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${id}/${safeFileName}`

      // A. Envia para o Storage (Nuvem)
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, selectedFile)

      if (!uploadError) {
        // B. Salva os metadados na Tabela
        await supabase.from('documentos').insert([
          {
            user_id: user.id,
            materia_id: id,
            tipo: activeTab,
            titulo: newTitle,
            arquivo_nome: selectedFile.name,
            arquivo_tamanho: formatFileSize(selectedFile.size),
            arquivo_caminho: filePath
          }
        ])
        
        // Sucesso! Atualiza a tela
        fetchDocumentos()
        setNewTitle('')
        setSelectedFile(null)
        setIsAdding(false)
      } else {
        alert('Erro ao enviar o arquivo. ' + uploadError.message)
      }
    }
    setIsUploading(false)
  }

  // 3. Deleta do Banco e do Storage
  async function handleDeleteDocument(docId: string, filePath: string) {
    if(!confirm('Tem certeza que deseja excluir este arquivo?')) return;
    
    // Deleta o arquivo físico
    await supabase.storage.from('documentos').remove([filePath])
    // Deleta o registro da tabela
    await supabase.from('documentos').delete().eq('id', docId)
    
    fetchDocumentos()
  }

  // 4. Abre o arquivo em uma nova aba
  function handleDownload(filePath: string) {
    const { data } = supabase.storage.from('documentos').getPublicUrl(filePath)
    window.open(data.publicUrl, '_blank')
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return
    const newMessages = [...messages, { role: 'user', content: prompt }]
    setMessages(newMessages)
    setPrompt('')
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'system', content: 'Processando...' }])
    }, 1000)
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setIsAdding(false)
    setNewTitle('')
    setSelectedFile(null)
  }

  function getFileDetails(fileName: string) {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return { icon: FileText, color: '#ef4444', label: 'PDF' }
      case 'png': case 'jpg': case 'jpeg': case 'gif': return { icon: ImageIcon, color: '#a855f7', label: 'IMG' }
      case 'ppt': case 'pptx': return { icon: Presentation, color: '#f97316', label: 'SLIDE' }
      case 'xls': case 'xlsx': case 'csv': return { icon: FileSpreadsheet, color: '#22c55e', label: 'PLANILHA' }
      case 'doc': case 'docx': return { icon: FileText, color: '#3b82f6', label: 'DOC' }
      default: return { icon: File, color: 'var(--brand-primary)', label: 'ARQUIVO' }
    }
  }

  // Filtra os documentos de acordo com a aba atual
  const docsDaAba = documentos.filter(doc => doc.tipo === activeTab)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <Link to="/materias" className={styles.backBtn}>
            <ChevronLeft size={20} />
            <span>Voltar para Matérias</span>
          </Link>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>{materia ? materia.nome : 'Carregando...'}</h1>
            <span className={styles.badge}>Modus Operandi Ativo</span>
          </div>
        </div>

        <nav className={styles.tabNav}>
          <button className={`${styles.tabBtn} ${activeTab === 'ia' ? styles.tabBtnActive : ''}`} onClick={() => handleTabChange('ia')}>
            <MessageSquare size={16} /> Estudo Integrado (IA)
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'resumos' ? styles.tabBtnActive : ''}`} onClick={() => handleTabChange('resumos')}>
            <FileText size={16} /> Resumos
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'materiais' ? styles.tabBtnActive : ''}`} onClick={() => handleTabChange('materiais')}>
            <Library size={16} /> Materiais
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'provas' ? styles.tabBtnActive : ''}`} onClick={() => handleTabChange('provas')}>
            <Calendar size={16} /> Datas de Prova
          </button>
        </nav>
      </header>

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          
          {/* ABA 1: Estudo Integrado à IA */}
          {activeTab === 'ia' && (
            <section className={styles.chatArena}>
              <div className={styles.chatHistory}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.systemWrapper}`}>
                    {msg.role === 'system' && (
                      <div className={styles.aiAvatar}><Sparkles size={16} /></div>
                    )}
                    <div className={`${styles.message} ${msg.role === 'user' ? styles.userMsg : styles.systemMsg}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <form className={styles.inputArea} onSubmit={handleSendMessage}>
                <input type="text" placeholder="Peça um resumo, gere um flashcard..." value={prompt} onChange={e => setPrompt(e.target.value)} className={styles.input} />
                <button type="submit" className={styles.sendBtn} disabled={!prompt.trim()}><Send size={18} /></button>
              </form>
            </section>
          )}

          {/* ABA 2 & 3: Resumos e Materiais */}
          {(activeTab === 'resumos' || activeTab === 'materiais') && (
            <section className={styles.tabSection}>
              <div className={styles.sectionHeader}>
                <h2>{activeTab === 'resumos' ? 'Meus Resumos' : 'Materiais de Consulta'}</h2>
                {!isAdding && (
                  <button className={styles.actionBtn} onClick={() => setIsAdding(true)}>
                    <Plus size={16} /> <span>{activeTab === 'resumos' ? 'Novo Resumo' : 'Adicionar Material'}</span>
                  </button>
                )}
              </div>

              {isAdding && (
                <form onSubmit={handleSaveDocument} className={styles.uploadCard}>
                  <div className={styles.uploadFields}>
                    <div className={styles.inputGroup}>
                      <label className={styles.fieldLabel}>Título do documento</label>
                      <input type="text" placeholder="Ex: Resumo de Árvores AVL..." value={newTitle} onChange={e => setNewTitle(e.target.value)} className={styles.docInput} required disabled={isUploading}/>
                    </div>

                    <div className={styles.fileDropzone} onClick={() => !isUploading && fileInputRef.current?.click()}>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                      {selectedFile ? (
                        <div className={styles.fileSelectedInfo}>
                          <File size={24} className={styles.materialIcon} />
                          <div className={styles.fileDetails}>
                            <span className={styles.fileNameLabel}>{selectedFile.name}</span>
                            <span className={styles.fileSizeLabel}>{formatFileSize(selectedFile.size)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.dropzonePlaceholder}>
                          <Paperclip size={20} className={styles.iconMuted} />
                          <span>Clique para anexar um arquivo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.uploadActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setIsAdding(false)} disabled={isUploading}>Cancelar</button>
                    <button type="submit" className={styles.submitBtn} disabled={!newTitle.trim() || !selectedFile || isUploading}>
                      {isUploading ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
                    </button>
                  </div>
                </form>
              )}

              <div className={styles.documentList}>
                {docsDaAba.length === 0 ? (
                  <div className={styles.placeholderArea}>
                    <p>Nenhum documento anexado.</p>
                  </div>
                ) : (
                  docsDaAba.map(item => {
                    const fileInfo = getFileDetails(item.fileName)
                    const FileIcon = fileInfo.icon

                    return (
                      <div key={item.id} className={styles.documentCard}>
                        <div className={styles.docMainInfo}>
                          <div className={styles.docIconWrapper} style={{ color: fileInfo.color, backgroundColor: `${fileInfo.color}15` }}>
                            <FileIcon size={24} strokeWidth={1.5} />
                          </div>
                          
                          <div className={styles.docMeta}>
                            <div className={styles.docTitleRow}>
                              <h4 className={styles.docTitle}>{item.title}</h4>
                              <span className={styles.docTypeBadge} style={{ color: fileInfo.color, backgroundColor: `${fileInfo.color}10`, borderColor: `${fileInfo.color}30` }}>
                                {fileInfo.label}
                              </span>
                            </div>
                            
                            <div className={styles.docSubMeta}>
                              <span className={styles.docFileName}>{item.fileName}</span>
                              <span className={styles.docDivider}>•</span>
                              <span className={styles.docSize}>{item.fileSize}</span>
                              <span className={styles.docDivider}>•</span>
                              <span className={styles.docDate}>{item.date}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={styles.docActionGroup}>
                          <button type="button" className={styles.iconBtn} onClick={() => handleDownload(item.filePath)} title="Baixar / Visualizar">
                            <Download size={18} />
                          </button>
                          <div className={styles.verticalDivider}></div>
                          <button 
                            type="button" 
                            className={`${styles.iconBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDeleteDocument(item.id, item.filePath)}
                            title="Excluir documento"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          )}

          {/* ABA 4: Datas de Prova */}
          {activeTab === 'provas' && (
            <section className={styles.tabSection}>
              <div className={styles.sectionHeader}>
                <h2>Calendário de Avaliações</h2>
                <button className={styles.actionBtn}><Plus size={16} /> Agendar Prova</button>
              </div>
              <div className={styles.placeholderArea}>
                <p>Nenhuma prova agendada.</p>
              </div>
            </section>
          )}
        </div>

        {/* LADO DIREITO Fixo */}
        <aside className={styles.sidePanel}>
          <div className={styles.toolCard}>
            <div className={styles.cardHeader}><h2>Modo Foco</h2></div>
            <div className={styles.pomodoroWrapper}><Pomodoro /></div>
          </div>
          <div className={styles.toolCard}>
            <div className={`${styles.cardHeader} ${styles.cardHeaderWithAction}`}>
              <h2>Links Importantes</h2>
              <button className={styles.addLinkBtn} title="Adicionar novo link"><Plus size={16} /></button>
            </div>
            <div className={styles.linksList}>
              <a href="#" className={styles.linkItem} target="_blank">
                <div className={styles.linkIconWrapper}><Link2 size={14} /></div>
                <span className={styles.linkText}>Sistema SEI - UFCG</span>
                <ExternalLink size={12} className={styles.externalIcon} />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}