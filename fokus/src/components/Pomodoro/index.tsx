import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import styles from './Pomodoro.module.css'

export function Pomodoro() {
  // 25 minutos em segundos (25 * 60 = 1500)
  const [timeLeft, setTimeLeft] = useState(1500)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let intervalId: number

    if (isRunning && timeLeft > 0) {
      intervalId = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      // Aqui poderemos adicionar um som de notificação no futuro
    }

    // Função de limpeza do useEffect para evitar vazamento de memória
    return () => {
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [isRunning, timeLeft])

  function toggleTimer() {
    setIsRunning(!isRunning)
  }

  function resetTimer() {
    setIsRunning(false)
    setTimeLeft(1500)
  }

  // Cálculos matemáticos para exibir o tempo formatado em MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  
  // padStart garante que sempre haverá 2 dígitos (ex: "09" em vez de "9")
  const displayTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className={styles.container}>
      <div className={styles.timeDisplay}>
        {displayTime}
      </div>
      
      <div className={styles.controls}>
        <button
          className={`${styles.mainBtn} ${isRunning ? styles.running : ''}`}
          onClick={toggleTimer}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          <span>{isRunning ? 'Pausar' : 'Focar'}</span>
        </button>
        
        <button 
          className={styles.resetBtn} 
          onClick={resetTimer} 
          title="Reiniciar ciclo"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  )
}