import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, FileText, ChevronLeft, ChevronRight, Sun, Moon, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  
  // Estado para os dados dinâmicos do usuário
  const [nomeUsuario, setNomeUsuario] = useState('Estudante')
  
  // 1. LAZY INITIALIZATION: Ao carregar, verifica o localStorage primeiro.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('@fokus:theme')
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme
    }
    return 'dark'
  })

  // 2. EFEITO DE SINCRONIZAÇÃO DE TEMA
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('@fokus:theme', theme)
  }, [theme])

  // 3. EFEITO PARA BUSCAR DADOS DO USUÁRIO NO SUPABASE
  useEffect(() => {
    async function buscarDadosUsuario() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && user.user_metadata?.full_name) {
        setNomeUsuario(user.user_metadata.full_name)
      } else if (user?.email) {
        setNomeUsuario(user.email.split('@')[0])
      }
    }
    buscarDadosUsuario()
  }, [])

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Extrai o primeiro nome e a inicial
  const primeiroNome = nomeUsuario.split(' ')[0]
  const inicialAvatar = primeiroNome.charAt(0).toUpperCase()

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
        <div className={styles.profileArea}>
          <div className={styles.avatar}>{inicialAvatar}</div>
          {!isCollapsed && <span className={styles.userName}>{primeiroNome}</span>}
        </div>
        
        <button onClick={handleLogout} className={styles.logoutBtn} title="Sair do sistema">
          <LogOut size={18} className={styles.icon} />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  )
}