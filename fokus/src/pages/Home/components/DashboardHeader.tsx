import styles from '../Home.module.css'

interface DashboardHeaderProps {
  saudacao: string
  userName: string
}

export function DashboardHeader({ saudacao, userName }: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{saudacao}, {userName}!</h1>
        <p className={styles.subtitle}>Pronto para a sessão de estudo de hoje?</p>
      </div>
    </header>
  )
}