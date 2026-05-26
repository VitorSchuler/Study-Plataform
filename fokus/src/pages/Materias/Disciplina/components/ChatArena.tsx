import { useState, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'
import styles from '../Disciplina.module.css'

interface ChatArenaProps {
  materiaNome?: string
  materiaModusOperandi?: string
}

export function ChatArena({ materiaNome, materiaModusOperandi }: ChatArenaProps) {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])

  useEffect(() => {
    if (materiaNome && materiaModusOperandi) {
      setMessages([
        {
          role: 'system',
          content: `Olá! Sou seu assistente focado em ${materiaNome}. Meu modus operandi está configurado como: "${materiaModusOperandi}". Como vamos começar hoje?`
        }
      ])
    }
  }, [materiaNome, materiaModusOperandi])

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: prompt }])
    setPrompt('')

    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { role: 'system', content: 'Processando seu pedido de acordo com suas diretrizes de estudo...' }
      ])
    }, 1000)
  }

  return (
    <section className={styles.chatArena}>
      <div className={styles.chatHistory}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.systemWrapper}`}>
            {msg.role === 'system' && <div className={styles.aiAvatar}><Sparkles size={16} /></div>}
            <div className={`${styles.message} ${msg.role === 'user' ? styles.userMsg : styles.systemMsg}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form className={styles.inputArea} onSubmit={handleSendMessage}>
        <input 
          type="text" 
          placeholder="Peça um resumo, gere um flashcard ou tire uma dúvida..." 
          value={prompt} 
          onChange={e => setPrompt(e.target.value)} 
          className={styles.input} 
        />
        <button type="submit" className={styles.sendBtn} disabled={!prompt.trim()}>
          <Send size={18} />
        </button>
      </form>
    </section>
  )
}