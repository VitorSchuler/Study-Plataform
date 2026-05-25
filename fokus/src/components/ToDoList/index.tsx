import { useState } from 'react'
import { Plus, Trash2, Check, Square } from 'lucide-react'
import styles from './ToDoList.module.css'

interface Task {
  id: number
  text: string
  completed: boolean
}

export function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now(),
      text: newTask,
      completed: false
    }

    setTasks([...tasks, task])
    setNewTask('')
  }

  function toggleTaskCompletion(id: number) {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  function handleDeleteTask(id: number) {
    setTasks(tasks.filter(task => task.id !== id))
  }

  return (
    <div className={styles.todoWrapper}>
      {/* Formulário para adicionar tarefa */}
      <form onSubmit={handleAddTask} className={styles.form}>
        <input
          type="text"
          placeholder="Adicionar uma nova tarefa ou meta..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.addBtn} title="Adicionar tarefa">
          <Plus size={18} />
        </button>
      </form>

      {/* Lista de tarefas */}
      <div className={styles.listContainer}>
        {tasks.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhuma tarefa para hoje. Toque no '+' para planejar seu dia.
          </div>
        ) : (
          <ul className={styles.list}>
            {tasks.map(task => (
              <li 
                key={task.id} 
                className={`${styles.item} ${task.completed ? styles.completed : ''}`}
              >
                <button 
                  type="button" 
                  className={styles.checkBtn}
                  onClick={() => toggleTaskCompletion(task.id)}
                >
                  {task.completed ? (
                    <Check size={16} className={styles.checkIcon} />
                  ) : (
                    <Square size={16} className={styles.squareIcon} />
                  )}
                </button>
                
                <span className={styles.taskText}>{task.text}</span>

                <button 
                  type="button" 
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteTask(task.id)}
                  title="Excluir tarefa"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}