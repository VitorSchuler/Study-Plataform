import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, FileText, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  
  // 1. LAZY INITIALIZATION: Ao carregar, verifica o localStorage primeiro.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Buscamos a chave '@fokus:theme'
    const storedTheme = localStorage.getItem('@fokus:theme')
    
    // Se existir algo salvo, usamos. Se não, o padrão é 'dark' (Neon).
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme
    }
    return 'dark'
  })

  // 2. EFEITO DE SINCRONIZAÇÃO: Sempre que a variável 'theme' mudar:
  useEffect(() => {
    // Muda a cor na tela
    document.documentElement.setAttribute('data-theme', theme)
    
    // Salva a nova escolha no navegador
    localStorage.setItem('@fokus:theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logoText}>
            {isCollapsed ? 'f.' : <>fokus<span className={styles.dot}>.</span></>}
          </span>
        </div>
        
        <button 
          className={styles.toggleBtn} 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className={styles.nav}>
        <Link to="/home" className={`${styles.navItem} ${location.pathname === '/home' ? styles.active : ''}`}>
          <LayoutDashboard size={20} className={styles.icon} />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>
        <Link to="/materias" className={`${styles.navItem} ${location.pathname === '/materias' ? styles.active : ''}`}>
          <BookOpen size={20} className={styles.icon} />
          {!isCollapsed && <span>Matérias</span>}
        </Link>
        <Link to="/resumos" className={`${styles.navItem} ${location.pathname === '/resumos' ? styles.active : ''}`}>
          <FileText size={20} className={styles.icon} />
          {!isCollapsed && <span>Resumos</span>}
        </Link>
      </nav>

      {/* Botão de Troca de Tema */}
      <div className={styles.themeToggleContainer}>
        <button className={styles.themeBtn} onClick={toggleTheme} title="Alternar Tema">
          {theme === 'dark' ? <Sun size={20} className={styles.icon} /> : <Moon size={20} className={styles.icon} />}
          {!isCollapsed && <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </button>
      </div>

      <div className={styles.footer}>
        <div className={styles.avatar}>V</div>
        {!isCollapsed && <span className={styles.userName}>Vitor</span>}
      </div>
    </aside>
  )
}