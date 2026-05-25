import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ChevronLeft, Send, Sparkles, FileText, BrainCircuit, 
  MessageSquare, Library, Calendar, Plus, Paperclip, 
  Trash2, File, Download, Image as ImageIcon, Presentation, 
  FileSpreadsheet, ExternalLink, Link2 
} from 'lucide-react'
import { Pomodoro } from '../../../components/Pomodoro'
import styles from './Disciplina.module.css'

type Tab = 'ia' | 'resumos' | 'materiais' | 'provas'

interface DocumentItem {
  id: number
  title: string
  fileName: string
  fileSize: string
  date: string
}

export default function Disciplina() {
  const { id } = useParams() 
  const [activeTab, setActiveTab] = useState<Tab>('ia')
  
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: 'Olá! Sou seu assistente de estudos. Lembre-se do nosso modus operandi: foco total em resoluções de problemas em C++ e análise assintótica. Como vamos começar hoje?'
    }
  ])

  const [resumos, setResumos] = useState<DocumentItem[]>([
    { id: 1, title: 'Introdução a Árvores Binárias', fileName: 'resumo_arvores.pdf', fileSize: '1.2 MB', date: '22/05/2026' },
    { id: 2, title: 'Mapa Mental: Big-O', fileName: 'mapa_big_o.png', fileSize: '850 KB', date: '23/05/2026' }
  ])
  const [materiais, setMateriais] = useState<DocumentItem[]>([
    { id: 1, title: 'Slides da Aula 04 - Grafos', fileName: 'aula_04_grafos.pptx', fileSize: '4.5 MB', date: '18/05/2026' },
    { id: 2, title: 'Planilha de Notas e Pesos', fileName: 'notas_estrutura.xlsx', fileSize: '120 KB', date: '20/05/2026' }
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function handleSaveDocument(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !selectedFile) return

    const newItem: DocumentItem = {
      id: Date.now(),
      title: newTitle,
      fileName: selectedFile.name,
      fileSize: formatFileSize(selectedFile.size),
      date: new Date().toLocaleDateString('pt-BR')
    }

    if (activeTab === 'resumos') {
      setResumos([newItem, ...resumos])
    } else if (activeTab === 'materiais') {
      setMateriais([newItem, ...materiais])
    }

    setNewTitle('')
    setSelectedFile(null)
    setIsAdding(false)
  }

  function handleDeleteDocument(id: number, type: 'resumos' | 'materiais') {
    if (type === 'resumos') {
      setResumos(resumos.filter(item => item.id !== id))
    } else {
      setMateriais(materiais.filter(item => item.id !== id))
    }
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return

    const newMessages = [...messages, { role: 'user', content: prompt }]
    setMessages(newMessages)
    setPrompt('')

    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { role: 'system', content: 'Processando seu pedido de acordo com suas diretrizes de estudo...' }
      ])
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
      case 'pdf': 
        return { icon: FileText, color: '#ef4444', label: 'PDF' }
      case 'png': case 'jpg': case 'jpeg': case 'gif': 
        return { icon: ImageIcon, color: '#a855f7', label: 'IMG' }
      case 'ppt': case 'pptx': 
        return { icon: Presentation, color: '#f97316', label: 'SLIDE' }
      case 'xls': case 'xlsx': case 'csv': 
        return { icon: FileSpreadsheet, color: '#22c55e', label: 'PLANILHA' }
      case 'doc': case 'docx': 
        return { icon: FileText, color: '#3b82f6', label: 'DOC' }
      default: 
        return { icon: File, color: 'var(--brand-primary)', label: 'ARQUIVO' }
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <Link to="/materias" className={styles.backBtn}>
            <ChevronLeft size={20} />
            <span>Voltar para Matérias</span>
          </Link>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Estrutura de Dados</h1>
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
                <input type="text" placeholder="Peça um resumo, gere um flashcard ou tire uma dúvida..." value={prompt} onChange={e => setPrompt(e.target.value)} className={styles.input} />
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
                      <input type="text" placeholder="Ex: Resumo de Árvores AVL..." value={newTitle} onChange={e => setNewTitle(e.target.value)} className={styles.docInput} required />
                    </div>

                    <div className={styles.fileDropzone} onClick={() => fileInputRef.current?.click()}>
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
                    <button type="button" className={styles.cancelBtn} onClick={() => setIsAdding(false)}>Cancelar</button>
                    <button type="submit" className={styles.submitBtn} disabled={!newTitle.trim() || !selectedFile}>Salvar</button>
                  </div>
                </form>
              )}

              <div className={styles.documentList}>
                {(activeTab === 'resumos' ? resumos : materiais).length === 0 ? (
                  <div className={styles.placeholderArea}>
                    <p>Nenhum documento anexado.</p>
                  </div>
                ) : (
                  (activeTab === 'resumos' ? resumos : materiais).map(item => {
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
                          <button type="button" className={styles.iconBtn} title="Baixar / Visualizar">
                            <Download size={18} />
                          </button>
                          <div className={styles.verticalDivider}></div>
                          <button 
                            type="button" 
                            className={`${styles.iconBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDeleteDocument(item.id, activeTab as 'resumos' | 'materiais')}
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

        {/* LADO DIREITO: Painel Estratégico Fixo */}
        <aside className={styles.sidePanel}>
          <div className={styles.toolCard}>
            <div className={styles.cardHeader}><h2>Modo Foco</h2></div>
            <div className={styles.pomodoroWrapper}><Pomodoro /></div>
          </div>

          <div className={styles.toolCard}>
            <div className={`${styles.cardHeader} ${styles.cardHeaderWithAction}`}>
              <h2>Links Importantes</h2>
              <button className={styles.addLinkBtn} title="Adicionar novo link">
                <Plus size={16} />
              </button>
            </div>
            
            <div className={styles.linksList}>
              <a href="#" className={styles.linkItem} target="_blank" rel="noopener noreferrer">
                <div className={styles.linkIconWrapper}>
                  <Link2 size={14} />
                </div>
                <span className={styles.linkText}>Sistema SEI - UFCG</span>
                <ExternalLink size={12} className={styles.externalIcon} />
              </a>

              <a href="#" className={styles.linkItem} target="_blank" rel="noopener noreferrer">
                <div className={styles.linkIconWrapper}>
                  <Link2 size={14} />
                </div>
                <span className={styles.linkText}>Documentação ReactJS</span>
                <ExternalLink size={12} className={styles.externalIcon} />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}