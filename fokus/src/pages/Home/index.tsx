import styles from './Home.module.css'
import { TodoList } from '../../components/ToDoList'
import { BarChart3, Clock, Flame, GraduationCap } from 'lucide-react' // Ícones para os mini cards de métricas

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Seu progresso acadêmico e métricas de aprendizado.</p>
        </div>
      </header>

      {/* Grid Principal */}
      <div className={styles.bentoGrid}>
        
        {/* CARD 1: Horas Estudadas por Matéria (Ocupa o lado esquerdo superior) */}
        <section className={`${styles.card} ${styles.statsCard}`}>
          <div className={styles.cardHeader}>
            <BarChart3 size={18} />
            <h2>Tempo de Estudo por Matéria</h2>
          </div>
          
          {/* Esqueleto da barra de progresso de exemplo para ilustrar o tempo por matéria */}
          <div className={styles.statsContent}>
            <div className={styles.subjectRow}>
              <div className={styles.subjectInfo}>
                <span className={styles.subjectName}>Estrutura de Dados</span>
                <span className={styles.subjectHours}>14h 30min</span>
              </div>
              <div className={styles.progressBarBase}>
                <div className={styles.progressBarFill} style={{ width: '80%' }} />
              </div>
            </div>

            <div className={styles.subjectRow}>
              <div className={styles.subjectInfo}>
                <span className={styles.subjectName}>Cálculo II</span>
                <span className={styles.subjectHours}>8h 15min</span>
              </div>
              <div className={styles.progressBarBase}>
                <div className={styles.progressBarFill} style={{ width: '45%' }} />
              </div>
            </div>

            <div className={styles.subjectRow}>
              <div className={styles.subjectInfo}>
                <span className={styles.subjectName}>Programação Web</span>
                <span className={styles.subjectHours}>5h 00min</span>
              </div>
              <div className={styles.progressBarBase}>
                <div className={styles.progressBarFill} style={{ width: '30%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* CARD 2: To-Do List (Ocupa toda a lateral direita da tela) */}
        <section className={`${styles.card} ${styles.todoCard}`}>
          <div className={styles.cardHeader}>
            <h2>Tarefas de Hoje</h2>
          </div>
          <TodoList />
        </section>

        {/* CARD 3: Métricas de Foco / Insights Úteis (Ocupa a parte inferior esquerda) */}
        <section className={`${styles.card} ${styles.insightsCard}`}>
          <div className={styles.cardHeader}>
            <h2>Resumo da Semana</h2>
          </div>
          
          <div className={styles.insightsGrid}>
            <div className={styles.insightMiniCard}>
              <Clock size={16} className={styles.insightIcon} />
              <div className={styles.insightData}>
                <span className={styles.insightValue}>27.5h</span>
                <span className={styles.insightLabel}>Total focado</span>
              </div>
            </div>

            <div className={styles.insightMiniCard}>
              <Flame size={16} className={styles.insightIcon} />
              <div className={styles.insightData}>
                <span className={styles.insightValue}>5 dias</span>
                <span className={styles.insightLabel}>Ofensiva (Streak)</span>
              </div>
            </div>

            <div className={styles.insightMiniCard}>
              <GraduationCap size={16} className={styles.insightIcon} />
              <div className={styles.insightData}>
                <span className={styles.insightValue}>Estrutura de Dados</span>
                <span className={styles.insightLabel}>Mais estudada</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}