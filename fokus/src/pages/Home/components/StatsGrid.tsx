import { BookOpen, FileText, Calendar } from 'lucide-react'
import styles from '../Home.module.css'

interface StatsGridProps {
  stats: {
    materias: number
    resumos: number
    provas: number
  }
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statIconWrapper} style={{ color: 'var(--brand-primary)', backgroundColor: 'rgba(167, 139, 255, 0.1)' }}>
          <BookOpen size={24} />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Matérias Ativas</span>
          <span className={styles.statValue}>{stats.materias}</span>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIconWrapper} style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
          <FileText size={24} />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Resumos Totais</span>
          <span className={styles.statValue}>{stats.resumos}</span>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIconWrapper} style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <Calendar size={24} />
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Exames à Porta</span>
          <span className={styles.statValue}>{stats.provas}</span>
        </div>
      </div>
    </div>
  )
}