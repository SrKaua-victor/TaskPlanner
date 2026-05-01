import { useDroppable } from "@dnd-kit/core"
import { memo } from "react"
import { LayoutList, Loader, CheckCircle } from "lucide-react"
import Card from "./Card"

type Task = {
  id: number
  title: string
  description: string
  date: string
  time: string
  status: string
  priority: "low" | "medium" | "high"
}

type ColumnProps = {
  title: string
  status: string
  tasks: Task[]
  deleteTask: (id: number) => void
  openEditModal: (task: Task) => void
}

const columnConfig = {
  todo: {
    topBorder: "border-t-blue-500",
    badge: "bg-blue-500/20 text-blue-400",
    icon: <LayoutList size={15} className="text-blue-400" />,
    empty: "Sem tarefas pendentes",
  },
  doing: {
    topBorder: "border-t-amber-500",
    badge: "bg-amber-500/20 text-amber-400",
    icon: <Loader size={15} className="text-amber-400" />,
    empty: "Nada em progresso",
  },
  done: {
    topBorder: "border-t-emerald-500",
    badge: "bg-emerald-500/20 text-emerald-400",
    icon: <CheckCircle size={15} className="text-emerald-400" />,
    empty: "Nenhuma tarefa concluída",
  },
}

function Column({ title, status, tasks, deleteTask, openEditModal }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: status })

  const filteredTasks = tasks.filter(task => task.status === status)
  const cfg = columnConfig[status as keyof typeof columnConfig]

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-800/50 backdrop-blur-md p-4 rounded-2xl w-72 shrink-0 flex flex-col gap-3 min-h-[420px] border border-white/8 border-t-2 ${cfg.topBorder}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {cfg.icon}
          <h2 className="font-semibold text-gray-200 text-sm">{title}</h2>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
          {filteredTasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-2">
            <div className="w-9 h-9 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
              <span className="text-gray-700 text-xs font-bold">0</span>
            </div>
            <p className="text-xs text-gray-600">{cfg.empty}</p>
          </div>
        )}

        {filteredTasks.map(task => (
          <Card
            key={task.id}
            task={task}
            deleteTask={deleteTask}
            openEditModal={openEditModal}
          />
        ))}
      </div>
    </div>
  )
}

export default memo(Column)
