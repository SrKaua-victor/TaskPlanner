import { useDraggable } from "@dnd-kit/core"
import { Pencil, Trash2, Calendar, Clock } from "lucide-react"

type Task = {
  id: number
  title: string
  description: string
  date: string
  time: string
  status: string
  priority: "low" | "medium" | "high"
}

type CardProps = {
  task: Task
  deleteTask: (id: number) => void
  openEditModal: (task: Task) => void
}

const priorityConfig = {
  low:    { border: "border-l-emerald-500", badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", label: "Baixa" },
  medium: { border: "border-l-amber-500",   badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30",   label: "Média" },
  high:   { border: "border-l-rose-500",    badge: "bg-rose-500/15 text-rose-400 border border-rose-500/30",    label: "Alta"  },
}

export default function Card({ task, deleteTask, openEditModal }: CardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: task.id })
  const p = priorityConfig[task.priority]

  return (
    <div
      ref={setNodeRef}
      className={`group bg-gray-800/90 backdrop-blur p-4 rounded-xl shadow-md hover:shadow-xl hover:shadow-black/40 transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-3 border border-white/8 border-l-4 ${p.border}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing font-semibold text-gray-100 text-sm leading-snug flex-1"
        >
          {task.title}
        </div>

        <div
          className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            aria-label="Editar tarefa"
            onClick={(e) => { e.stopPropagation(); openEditModal(task) }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/15 transition"
          >
            <Pencil size={13} />
          </button>
          <button
            aria-label="Excluir tarefa"
            onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/15 transition"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.badge}`}>
          {p.label}
        </span>

        {(task.date || task.time) && (
          <div className="flex items-center gap-3 text-xs text-gray-600">
            {task.date && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {task.date}
              </span>
            )}
            {task.time && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {task.time}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
