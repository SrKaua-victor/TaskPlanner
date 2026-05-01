"use client"
import { Plus, X, LayoutGrid, Folder, Bell, Search } from "lucide-react"
import { useState, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from "@dnd-kit/core"
import Column from "./Column"

type Task = {
  id: number
  title: string
  description: string
  date: string
  time: string
  status: string
  priority: "low" | "medium" | "high"
}

const inputStyle =
  "w-full bg-gray-700/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    priority: "medium" as "low" | "medium" | "high"
  })

  useEffect(() => {
    const saved = localStorage.getItem("tasks")
    if (saved) setTasks(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  function addTask() {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      date: newTask.date,
      time: newTask.time,
      status: "todo",
      priority: newTask.priority
    }

    setTasks(prev => [...prev, task])
    setNewTask({ title: "", description: "", date: "", time: "", priority: "medium" })
    setShowForm(false)
  }

  function deleteTask(id: number) {
    if (!confirm("Tem certeza que deseja excluir?")) return
    setTasks(prev => prev.filter(task => task.id !== id))
  }

  function openEditModal(task: Task) {
    setEditingTask(task)
  }

  function saveEditTask(updatedTask: Task) {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task))
    setEditingTask(null)
  }

  function handleDragStart(event: DragStartEvent) {
    const taskId = Number(event.active.id)
    const task = tasks.find(t => t.id === taskId)
    if (task) setActiveTask(task)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const taskId = Number(active.id)
    const newStatus = over.id as string
    setTasks(prev =>
      prev.map(task => task.id === taskId ? { ...task, status: newStatus } : task)
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 min-h-screen">

      {/* NAVBAR */}
      <nav className="w-full bg-gray-950/80 backdrop-blur-xl border-b border-white/8 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2.5 text-white font-bold tracking-tight text-sm">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <LayoutGrid size={14} />
            </div>
            Task Planner
          </span>

          <div className="hidden md:flex gap-1">
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-200 hover:bg-white/8 px-3 py-1.5 rounded-lg transition">
              <LayoutGrid size={13} /> Boards
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-200 hover:bg-white/8 px-3 py-1.5 rounded-lg transition">
              <Folder size={13} /> Projetos
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center px-6">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            <input
              placeholder="Buscar tarefas..."
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-gray-600 hover:text-gray-200 hover:bg-white/8 transition">
            <Bell size={17} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
            U
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="p-6 max-w-screen-xl mx-auto">

        {/* PAGE HEADER */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel de Tarefas</h1>
          <p className="text-sm text-gray-600 mt-1">
            Organize e acompanhe todas as suas tarefas.
          </p>
        </div>

        {/* NEW TASK BUTTON */}
        <button
          onClick={() => setShowForm(prev => !prev)}
          className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-all duration-300 ${
            showForm
              ? "bg-white/8 text-gray-400 hover:bg-white/12"
              : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-950/60"
          }`}
        >
          <span
            className="transition-transform duration-300"
            style={{ transform: showForm ? "rotate(45deg)" : "rotate(0deg)" }}
          >
            <Plus size={15} />
          </span>
          {showForm ? "Fechar" : "Nova Tarefa"}
        </button>

        {/*
          FORM — sempre montado no DOM.
          grid-template-rows anima a altura de 0 → 1fr suavemente,
          sem fazer as colunas pularem.
        */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: showForm ? "1fr" : "0fr",
            transition: "grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          <div style={{ overflow: "hidden", minHeight: 0 }}>
            <div
              className={`pb-7 px-px transition-[opacity,transform] duration-300 ease-in-out ${
                showForm ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
              }`}
            >
              <div className="max-w-md bg-gray-900/80 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-2xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">
                  Criar nova tarefa
                </p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">
                      Título <span className="text-rose-500">*</span>
                    </label>
                    <input
                      placeholder="Ex: Finalizar relatório"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Descrição</label>
                    <input
                      placeholder="Detalhes da tarefa..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className={inputStyle}
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1.5 block">Data</label>
                      <input
                        type="date"
                        value={newTask.date}
                        onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                        className={inputStyle}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1.5 block">Hora</label>
                      <input
                        type="time"
                        value={newTask.time}
                        onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                        className={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Prioridade</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) =>
                        setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })
                      }
                      className={inputStyle}
                    >
                      <option value="low" className="bg-gray-900">Baixa</option>
                      <option value="medium" className="bg-gray-900">Média</option>
                      <option value="high" className="bg-gray-900">Alta</option>
                    </select>
                  </div>

                  <button
                    onClick={addTask}
                    className="mt-1 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition shadow-lg shadow-indigo-950/50"
                  >
                    Adicionar Tarefa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOARD */}
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-5 overflow-x-auto pb-6">
            <Column title="A Fazer"      status="todo"  tasks={tasks} deleteTask={deleteTask} openEditModal={openEditModal} />
            <Column title="Em Progresso" status="doing" tasks={tasks} deleteTask={deleteTask} openEditModal={openEditModal} />
            <Column title="Concluído"    status="done"  tasks={tasks} deleteTask={deleteTask} openEditModal={openEditModal} />
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="bg-gray-800 border border-white/20 px-4 py-3 rounded-xl shadow-2xl w-64 text-gray-100 text-sm font-medium cursor-grabbing">
                {activeTask.title}
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* EDIT MODAL */}
        {editingTask && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={() => setEditingTask(null)}
          >
            <div
              className="bg-gray-900 border border-white/12 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-white text-base">Editar Tarefa</h2>
                <button
                  onClick={() => setEditingTask(null)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-gray-200 hover:bg-white/8 transition"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Título</label>
                  <input
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Descrição</label>
                  <input
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1.5 block">Data</label>
                    <input
                      type="date"
                      value={editingTask.date}
                      onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1.5 block">Hora</label>
                    <input
                      type="time"
                      value={editingTask.time}
                      onChange={(e) => setEditingTask({ ...editingTask, time: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Prioridade</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, priority: e.target.value as "low" | "medium" | "high" })
                    }
                    className={inputStyle}
                  >
                    <option value="low" className="bg-gray-900">Baixa</option>
                    <option value="medium" className="bg-gray-900">Média</option>
                    <option value="high" className="bg-gray-900">Alta</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-200 hover:bg-white/8 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => saveEditTask(editingTask)}
                  className="px-4 py-2 rounded-xl text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-lg shadow-indigo-950/40"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
