import { Calendar, TrendingUp, Clock } from 'lucide-react'
import styles from '../Home.module.css'

export interface Prova {
  id: string
  nome: string
  data_prova: string
  materias: { nome: string }
}

interface ExamsTimelineProps {
  proximasProvas: Prova[]
}

export function ExamsTimeline({ proximasProvas }: ExamsTimelineProps) {
  return (
    <section className={styles.dashboardSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <TrendingUp size={20} className={styles.sectionIcon} />
          <h2>Cronograma de Exames</h2>
        </div>
      </div>

      <div className={styles.cardList}>
        {proximasProvas.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={32} className={styles.emptyIcon} />
            <p>Sem exames marcados para os próximos dias.</p>
          </div>
        ) : (
          proximasProvas.map(prova => {
            const dataProva = new Date(prova.data_prova)
            const dataFormatada = dataProva.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
            
            return (
              <div key={prova.id} className={styles.listItem}>
                <div className={styles.itemDateBox}>
                  <span className={styles.dateDay}>{dataProva.getUTCDate()}</span>
                  <span className={styles.dateMonth}>
                    {dataProva.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '')}
                  </span>
                </div>
                <div className={styles.itemInfo}>
                  <h4 className={styles.itemTitle}>{prova.nome}</h4>
                  <span className={styles.itemSubtitle}>{prova.materias.nome}</span>
                </div>
                <div className={styles.itemAction}>
                  <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                  <span className={styles.dateFull}>{dataFormatada}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}