import { useMemo, useState, type ReactNode } from "react"
import {
  BookOpenIcon,
  ChevronRightIcon,
  CloudUploadIcon,
  CornerUpRightIcon,
  DownloadIcon,
  FolderIcon,
  FolderOpenIcon,
  GripVerticalIcon,
  HardDriveIcon,
  LayersIcon,
  LayoutGridIcon,
  ListIcon,
  PaperclipIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"

import type {
  ContentFile,
  ContentNode,
  Level,
  PermMap,
  RowState,
} from "@/types/contenidos"
import { MAX_FILE_BYTES } from "@/types/contenidos"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { count, fileMeta, fmtBytes, fmtDate, plural } from "./contenidos-meta"
import { RowMenu, type MenuItem } from "./row-menu"
import { TreeNode } from "./content-tree"
import { NodeDialog, type NodeForm } from "./node-dialog"
import { DeleteNodeDialog } from "./delete-node-dialog"
import { UploadDialog } from "./upload-dialog"
import { queueFiles, type QueuedFile } from "./upload-utils"
import { DownloadDialog, type LinkResult } from "./download-dialog"

export interface ExplorerMutations {
  createNode: (data: NodeForm, ctx: { levelId: string; parentId: string | null }) => Promise<string | null>
  updateNode: (id: string, data: NodeForm) => Promise<string | null>
  deleteNode: (node: ContentNode) => Promise<string | null>
  reorderNodes: (parentId: string | null, orderedIds: string[]) => Promise<string | null>
  uploadFiles: (node: ContentNode, files: File[]) => Promise<string | null>
  deleteFile: (file: ContentFile) => Promise<string | null>
  requestLink: (file: ContentFile) => Promise<LinkResult>
}

interface ExplorerPanelProps {
  levels: Level[]
  nodes: ContentNode[]
  files: ContentFile[]
  perms: PermMap
  mutations: ExplorerMutations
  flash: (variant: "success" | "info" | "warning" | "danger", msg: string) => void
}

type Modal =
  | { type: "node"; mode: "create" | "edit"; level: Level; parent: ContentNode | null; node?: ContentNode }
  | { type: "del-node"; node: ContentNode; level: Level; cascade: string[] }
  | { type: "upload"; initial?: QueuedFile[] }
  | { type: "download"; file: ContentFile }
  | null

/** Estado RBAC → o no renderiza (hidden) o entrega `disabled` al render. */
function gate(state: RowState, render: (disabled: boolean) => ReactNode): ReactNode {
  if (state === "hidden") return null
  return render(state === "disabled")
}

/**
 * Explorador estilo Drive: árbol lateral + área principal que navega el árbol
 * nivel por nivel (como el backend vía `parentId`). CRUD de nodos, panel de
 * archivos en nodos hoja (subida, descarga pre-firmada, borrado) y reordenación
 * de hermanos por arrastre. Cada acción de escritura respeta su estado RBAC.
 */
export function ExplorerPanel({ levels, nodes, files, perms, mutations, flash }: ExplorerPanelProps) {
  const [path, setPath] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const [modal, setModal] = useState<Modal>(null)
  const [busy, setBusy] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [osOver, setOsOver] = useState(false)

  // ── Derivaciones de la jerarquía ────────────────────────────────────
  const sortedLevels = useMemo(() => [...levels].sort((a, b) => a.depth - b.depth), [levels])
  const minDepth = sortedLevels.length ? sortedLevels[0].depth : 0
  const maxDepth = sortedLevels.length ? sortedLevels[sortedLevels.length - 1].depth : 0
  const levelById = (id: string) => levels.find((l) => l.id === id)
  const levelByDepth = (d: number) => sortedLevels.find((l) => l.depth === d)
  const nodeById = (id: string) => nodes.find((n) => n.id === id)
  const isLeaf = (node: ContentNode) => {
    const l = levelById(node.levelId)
    return !!l && l.depth === maxDepth
  }

  const childrenOf = (pid: string | null) =>
    nodes
      .filter((n) => n.parentId === pid)
      .sort((a, b) => a.orderIndex - b.orderIndex || a.name.localeCompare(b.name))
  const filesOf = (nid: string) =>
    files.filter((f) => f.nodeId === nid).sort((a, b) => a.filename.localeCompare(b.filename))

  const emptyHierarchy = sortedLevels.length === 0
  const currentNode = path.length ? nodeById(path[path.length - 1]) ?? null : null
  const currentDepth = currentNode ? levelById(currentNode.levelId)!.depth : minDepth - 1
  const childLevel = levelByDepth(currentDepth + 1)
  const atLeaf = !!currentNode && isLeaf(currentNode)

  const children = childrenOf(currentNode ? currentNode.id : null)
  const currentFiles = atLeaf ? filesOf(currentNode!.id) : []
  const q = query.trim().toLowerCase()
  const filteredChildren = q ? children.filter((n) => n.name.toLowerCase().includes(q)) : children
  const filteredFiles = q ? currentFiles.filter((f) => f.filename.toLowerCase().includes(q)) : currentFiles
  const trail = path.map((id) => nodeById(id)).filter((n): n is ContentNode => !!n)
  const canReorder = perms["nodes.edit"] === "enabled" && !q

  // ── Navegación ──────────────────────────────────────────────────────
  const goTo = (ids: string[]) => {
    setPath(ids)
    setExpanded((prev) => {
      const s = new Set(prev)
      ids.forEach((id) => s.add(id))
      return s
    })
  }
  const openNode = (node: ContentNode) => goTo([...path, node.id])
  const toggleExp = (id: string) =>
    setExpanded((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  const selectTreeNode = (node: ContentNode, depth: number) => {
    const idx = path.indexOf(node.id)
    goTo(idx >= 0 ? path.slice(0, idx + 1) : [...path.slice(0, depth), node.id])
  }

  // ── Subárbol para el borrado en cascada ─────────────────────────────
  const cascadeParts = (rootId: string): string[] => {
    const byLevel: Record<string, number> = {}
    let fileCount = filesOf(rootId).length
    const walk = (pid: string) =>
      childrenOf(pid).forEach((ch) => {
        byLevel[ch.levelId] = (byLevel[ch.levelId] || 0) + 1
        fileCount += filesOf(ch.id).length
        walk(ch.id)
      })
    walk(rootId)
    const rootDepth = levelById(nodeById(rootId)!.levelId)!.depth
    const parts = sortedLevels
      .filter((l) => l.depth > rootDepth && byLevel[l.id])
      .map((l) => count(l.name.toLowerCase(), byLevel[l.id]))
    if (fileCount) parts.push(count("archivo", fileCount))
    return parts
  }

  // ── Acciones de nodo ────────────────────────────────────────────────
  const closeModal = () => {
    setModal(null)
    setDialogError(null)
  }
  const openCreate = () => {
    if (!childLevel) return
    setDialogError(null)
    setModal({ type: "node", mode: "create", level: childLevel, parent: currentNode })
  }
  const openEdit = (node: ContentNode) => {
    setDialogError(null)
    setModal({
      type: "node",
      mode: "edit",
      level: levelById(node.levelId)!,
      parent: node.parentId ? nodeById(node.parentId) ?? null : null,
      node,
    })
  }
  const openDelete = (node: ContentNode) => {
    setDialogError(null)
    setModal({ type: "del-node", node, level: levelById(node.levelId)!, cascade: cascadeParts(node.id) })
  }

  const saveNode = async (data: NodeForm) => {
    if (!modal || modal.type !== "node") return
    setBusy(true)
    setDialogError(null)
    const err =
      modal.mode === "edit"
        ? await mutations.updateNode(modal.node!.id, data)
        : await mutations.createNode(data, { levelId: modal.level.id, parentId: currentNode?.id ?? null })
    setBusy(false)
    if (err) {
      setDialogError(err)
      return
    }
    flash("success", modal.mode === "edit" ? "Nodo actualizado." : `${modal.level.name} «${data.name}» creado.`)
    closeModal()
  }

  const confirmDeleteNode = async () => {
    if (!modal || modal.type !== "del-node") return
    const target = modal.node
    setBusy(true)
    setDialogError(null)
    const err = await mutations.deleteNode(target)
    setBusy(false)
    if (err) {
      setDialogError(err)
      return
    }
    if (path.includes(target.id)) setPath(path.slice(0, path.indexOf(target.id)))
    flash("success", `«${target.name}» y su contenido fueron eliminados.`)
    closeModal()
  }

  // ── Reordenación de hermanos (orderIndex) ───────────────────────────
  const reorder = async (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return
    const ids = children.map((n) => n.id)
    const from = ids.indexOf(draggedId)
    const to = ids.indexOf(targetId)
    if (from < 0 || to < 0) return
    ids.splice(to, 0, ids.splice(from, 1)[0])
    const err = await mutations.reorderNodes(currentNode?.id ?? null, ids)
    flash(err ? "danger" : "success", err ?? "Orden actualizado.")
  }

  const folderDnd = (node: ContentNode) => {
    if (!canReorder) return {}
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        setDragId(node.id)
        e.dataTransfer.effectAllowed = "move"
        try {
          e.dataTransfer.setData("text/plain", node.id)
        } catch {
          /* algunos navegadores bloquean setData en dragstart sintético */
        }
      },
      onDragEnter: () => {
        if (dragId && dragId !== node.id) setOverId(node.id)
      },
      onDragOver: (e: React.DragEvent) => {
        if (dragId) e.preventDefault()
      },
      onDragEnd: () => {
        setDragId(null)
        setOverId(null)
      },
      onDrop: (e: React.DragEvent) => {
        if (dragId) {
          e.preventDefault()
          void reorder(dragId, node.id)
          setDragId(null)
          setOverId(null)
        }
      },
    }
  }

  // ── Archivos ────────────────────────────────────────────────────────
  const doUpload = async (accepted: File[]) => {
    if (!currentNode) return
    setBusy(true)
    setDialogError(null)
    const err = await mutations.uploadFiles(currentNode, accepted)
    setBusy(false)
    if (err) {
      setDialogError(err)
      return
    }
    flash("success", `${count("archivo", accepted.length)} subido${accepted.length === 1 ? "" : "s"} a «${currentNode.name}».`)
    closeModal()
  }
  const removeFile = async (file: ContentFile) => {
    const err = await mutations.deleteFile(file)
    flash(err ? "danger" : "success", err ?? `«${file.filename}» eliminado.`)
  }

  const onOsDrop = (list: FileList) => {
    if (!atLeaf) {
      flash("warning", "Solo las clases (nodos hoja) admiten archivos. Entra a una clase para subir.")
      return
    }
    if (perms["files.upload"] !== "enabled") {
      flash("danger", "No tienes permiso para subir archivos aquí.")
      return
    }
    const arr = Array.from(list)
    if (!arr.length) return
    const queued = queueFiles(arr)
    if (queued.every((f) => f.ok)) void doUpload(arr)
    else setModal({ type: "upload", initial: queued })
  }

  // ── Sub-componentes de fila ─────────────────────────────────────────
  const folderMenu = (node: ContentNode): MenuItem[] => [
    { icon: CornerUpRightIcon, label: "Abrir", state: "enabled", onClick: () => openNode(node) },
    { icon: PencilIcon, label: "Cambiar nombre", state: perms["nodes.edit"], onClick: () => openEdit(node) },
    { icon: Trash2Icon, label: "Eliminar", danger: true, state: perms["nodes.delete"], onClick: () => openDelete(node) },
  ]

  const folderMeta = (node: ContentNode) => {
    const leaf = isLeaf(node)
    const childLv = levelByDepth(levelById(node.levelId)!.depth + 1)
    const cc = leaf ? filesOf(node.id).length : childrenOf(node.id).length
    const unit = leaf ? "archivo" : childLv ? childLv.name.toLowerCase() : "ítem"
    return { leaf, cc, unit }
  }

  function FolderCard({ node }: { node: ContentNode }) {
    const { leaf, cc, unit } = folderMeta(node)
    const Glyph = leaf ? BookOpenIcon : FolderIcon
    return (
      <div
        onDoubleClick={() => openNode(node)}
        {...folderDnd(node)}
        className={cn(
          "flex flex-col rounded-xl border border-border bg-background px-3.5 pt-3 pb-3.5 transition-shadow hover:shadow-xs",
          canReorder && "cursor-grab",
          dragId === node.id && "opacity-40",
          overId === node.id && "outline outline-2 outline-offset-1 outline-primary"
        )}
      >
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "grid size-[42px] place-items-center rounded-[11px]",
              leaf ? "bg-secondary/25 text-foreground" : "bg-primary-soft text-primary"
            )}
          >
            <Glyph className="size-5" />
          </span>
          <RowMenu items={folderMenu(node)} />
        </div>
        <button
          type="button"
          onClick={() => openNode(node)}
          className="mt-2.5 flex flex-col gap-0.5 text-left outline-none"
        >
          <span className="truncate text-[13.5px] font-semibold text-foreground">{node.name}</span>
          <span className="text-xs text-muted">{count(unit, cc)}</span>
        </button>
      </div>
    )
  }

  function FolderRow({ node }: { node: ContentNode }) {
    const { leaf, cc, unit } = folderMeta(node)
    const Glyph = leaf ? BookOpenIcon : FolderIcon
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => openNode(node)}
        onKeyDown={(e) => {
          if (e.key === "Enter") openNode(node)
        }}
        {...folderDnd(node)}
        className={cn(
          "flex w-full items-center gap-3.5 rounded-xl border border-border bg-background px-3.5 py-3 text-left transition-shadow hover:shadow-xs",
          canReorder ? "cursor-grab" : "cursor-pointer",
          dragId === node.id && "opacity-40",
          overId === node.id && "shadow-[0_0_0_2px_var(--color-primary)]"
        )}
      >
        {canReorder && (
          <span className="flex-none text-border" title="Arrastra para reordenar">
            <GripVerticalIcon className="size-4" />
          </span>
        )}
        <span
          className={cn(
            "grid size-10 flex-none place-items-center rounded-[10px]",
            leaf ? "bg-secondary/25 text-foreground" : "bg-primary-soft text-primary"
          )}
        >
          <Glyph className={leaf ? "size-[17px]" : "size-[18px]"} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold">{node.name}</span>
          {node.description && (
            <span className="hidden truncate text-[12.5px] text-muted sm:block">{node.description}</span>
          )}
        </span>
        <span className="inline-flex flex-none items-center gap-1.5 text-[12.5px] font-medium whitespace-nowrap text-muted [&_svg]:size-[13px] [&_svg]:text-muted">
          {leaf ? <PaperclipIcon /> : <FolderIcon />} {count(unit, cc)}
        </span>
        <span className="flex-none" onClick={(e) => e.stopPropagation()}>
          <RowMenu items={folderMenu(node)} />
        </span>
      </div>
    )
  }

  function FileRow({ file }: { file: ContentFile }) {
    const m = fileMeta(file.filename)
    const Glyph = m.icon
    return (
      <div className="flex items-center gap-[13px] rounded-xl border border-border bg-background px-3.5 py-3">
        <span className="grid size-[38px] flex-none place-items-center rounded-[9px] bg-surface text-primary">
          <Glyph className="size-[18px]" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate font-mono text-[13.5px] font-semibold">{file.filename}</span>
          <span className="flex items-center gap-2 text-xs text-muted">
            <Badge variant="neutral">{m.label}</Badge>
            <span className="font-mono">{fmtBytes(file.sizeBytes)}</span>
            <span className="text-border">·</span>
            {fmtDate(file.createdAt)}
          </span>
        </span>
        <Button size="sm" variant="outline" onClick={() => setModal({ type: "download", file })}>
          <DownloadIcon /> Descargar
        </Button>
        <RowMenu
          items={[
            {
              icon: DownloadIcon,
              label: "Descargar",
              state: "enabled",
              onClick: () => setModal({ type: "download", file }),
            },
            {
              icon: Trash2Icon,
              label: "Eliminar",
              danger: true,
              state: perms["files.delete"],
              onClick: () => void removeFile(file),
            },
          ]}
        />
      </div>
    )
  }

  // ── Estado: jerarquía vacía ─────────────────────────────────────────
  if (emptyHierarchy) {
    return (
      <div className="flex min-h-[560px] overflow-hidden rounded-xl border border-border bg-background shadow-xs">
        <div className="m-6 flex flex-1 flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed border-border py-[52px] text-center">
          <span className="mb-1 grid size-[52px] place-items-center rounded-[14px] bg-surface text-muted">
            <LayersIcon className="size-[26px]" />
          </span>
          <div className="text-[15px] font-semibold">No hay niveles configurados</div>
          <div className="max-w-[46ch] text-[13px] leading-normal text-muted text-pretty">
            La jerarquía de contenido está vacía (422 CONTENT.HIERARCHY.EMPTY). Configúrala en el
            microservicio antes de crear nodos.
          </div>
        </div>
      </div>
    )
  }

  const roots = childrenOf(null)
  const rootUnit = plural(levelByDepth(minDepth)?.name.toLowerCase() ?? "elemento", 2)

  const primaryAction = atLeaf
    ? gate(perms["files.upload"], (d) => (
        <Button disabled={d} onClick={() => setModal({ type: "upload" })}>
          <UploadIcon /> Subir archivos
        </Button>
      ))
    : childLevel &&
      gate(perms["nodes.create"], (d) => (
        <Button disabled={d} onClick={openCreate}>
          <PlusIcon /> Agregar {childLevel.name.toLowerCase()}
        </Button>
      ))

  return (
    <div className="flex min-h-[560px] overflow-hidden rounded-xl border border-border bg-background shadow-xs">
      {/* árbol lateral */}
      <aside className="flex w-[244px] flex-none flex-col border-r border-border bg-surface p-2 max-[880px]:hidden">
        <button
          type="button"
          onClick={() => setPath([])}
          className={cn(
            "mb-0.5 flex w-full items-center gap-1.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
            path.length === 0 ? "bg-primary-soft font-semibold text-primary" : "text-foreground hover:bg-background"
          )}
        >
          <span className="inline-flex flex-none">
            <HardDriveIcon className="size-[15px]" />
          </span>
          Contenido
        </button>
        <div className="mt-1 overflow-auto" role="tree">
          {roots.map((n) => (
            <TreeNode
              key={n.id}
              node={n}
              depth={0}
              activeId={currentNode?.id ?? null}
              expanded={expanded}
              childrenOf={childrenOf}
              isLeaf={isLeaf}
              onSelect={selectTreeNode}
              onToggle={toggleExp}
            />
          ))}
          {roots.length === 0 && <div className="p-2.5 text-[12.5px] text-muted">Sin {rootUnit}</div>}
        </div>
      </aside>

      {/* área principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3.5 border-b border-border px-4 py-[11px]">
          <nav aria-label="Ubicación" className="flex flex-wrap items-center gap-0.5">
            <button
              type="button"
              onClick={() => setPath([])}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm px-[9px] py-[5px] text-[13px] font-medium transition-colors [&_svg]:size-3.5 [&_svg]:text-muted",
                path.length ? "text-muted hover:bg-background hover:text-foreground" : "font-semibold text-foreground"
              )}
            >
              <HardDriveIcon /> Contenido
            </button>
            {trail.map((n, i) => (
              <span key={n.id} className="flex items-center gap-0.5">
                <span className="inline-flex text-border">
                  <ChevronRightIcon className="size-3.5" />
                </span>
                <button
                  type="button"
                  onClick={() => setPath(path.slice(0, i + 1))}
                  className={cn(
                    "rounded-sm px-[9px] py-[5px] text-[13px] font-medium transition-colors",
                    i === trail.length - 1
                      ? "font-semibold text-foreground"
                      : "text-muted hover:bg-background hover:text-foreground"
                  )}
                >
                  {n.name}
                </button>
              </span>
            ))}
          </nav>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label className="flex min-w-[150px] flex-[0_1_220px] items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-muted">
              <SearchIcon className="size-[15px] flex-none" />
              <input
                placeholder="Buscar aquí…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
            {!atLeaf && childLevel && (
              <div className="inline-flex overflow-hidden rounded-md border border-border">
                <button
                  type="button"
                  aria-label="Cuadrícula"
                  onClick={() => setView("grid")}
                  className={cn(
                    "grid size-8 place-items-center transition-colors",
                    view === "grid" ? "bg-primary-soft text-primary" : "bg-background text-muted hover:text-foreground"
                  )}
                >
                  <LayoutGridIcon className="size-[15px]" />
                </button>
                <button
                  type="button"
                  aria-label="Lista"
                  onClick={() => setView("list")}
                  className={cn(
                    "grid size-8 place-items-center border-l border-border transition-colors",
                    view === "list" ? "bg-primary-soft text-primary" : "bg-background text-muted hover:text-foreground"
                  )}
                >
                  <ListIcon className="size-[15px]" />
                </button>
              </div>
            )}
            {primaryAction}
          </div>
        </div>

        <div
          className="relative flex-1 overflow-auto p-[18px] pb-7"
          onDragOver={(e) => {
            if (Array.from(e.dataTransfer.types || []).includes("Files")) {
              e.preventDefault()
              setOsOver(true)
            }
          }}
          onDragLeave={(e) => {
            if (e.currentTarget === e.target) setOsOver(false)
          }}
          onDrop={(e) => {
            if (Array.from(e.dataTransfer.types || []).includes("Files")) {
              e.preventDefault()
              setOsOver(false)
              onOsDrop(e.dataTransfer.files)
            }
          }}
        >
          {atLeaf ? (
            <>
              <div className="m-0 mb-3 flex items-center gap-2.5">
                <span className="text-[11.5px] font-semibold tracking-[0.05em] text-muted uppercase">Archivos</span>
                <Badge variant="primary" dot>
                  Nodo hoja
                </Badge>
              </div>
              {filteredFiles.length === 0 ? (
                <Hollow
                  icon={<CloudUploadIcon className="size-6" />}
                  title={query ? "Sin resultados" : "Arrastra tus archivos aquí"}
                  desc={
                    query
                      ? "Prueba con otro término."
                      : "Suelta apuntes, guías o presentaciones para subirlos. Máximo 500 MB por archivo."
                  }
                >
                  {!query &&
                    gate(perms["files.upload"], (d) => (
                      <Button disabled={d} variant="outline" onClick={() => setModal({ type: "upload" })}>
                        <UploadIcon /> Seleccionar archivos
                      </Button>
                    ))}
                </Hollow>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredFiles.map((f) => (
                    <FileRow key={f.id} file={f} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {childLevel && (
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="text-[11.5px] font-semibold tracking-[0.05em] text-muted uppercase">
                    {plural(childLevel.name, 2)}
                  </span>
                  {canReorder && filteredChildren.length > 1 && (
                    <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted [&_svg]:size-[13px] [&_svg]:text-border">
                      <GripVerticalIcon /> Arrastra para reordenar
                    </span>
                  )}
                </div>
              )}
              {filteredChildren.length === 0 ? (
                <Hollow
                  icon={<FolderOpenIcon className="size-6" />}
                  title={query ? "Sin resultados" : `Sin ${childLevel ? plural(childLevel.name.toLowerCase(), 2) : "elementos"}`}
                  desc={
                    query
                      ? "Prueba con otro término."
                      : childLevel
                        ? `Crea el primer ${childLevel.name.toLowerCase()} para poblar este nivel.`
                        : "Este nivel no tiene sub-niveles."
                  }
                >
                  {!query &&
                    childLevel &&
                    gate(perms["nodes.create"], (d) => (
                      <Button disabled={d} variant="outline" onClick={openCreate}>
                        <PlusIcon /> Agregar {childLevel.name.toLowerCase()}
                      </Button>
                    ))}
                </Hollow>
              ) : view === "grid" ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(206px,1fr))] gap-3">
                  {filteredChildren.map((n) => (
                    <FolderCard key={n.id} node={n} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredChildren.map((n) => (
                    <FolderRow key={n.id} node={n} />
                  ))}
                </div>
              )}
            </>
          )}

          {osOver && (
            <div className="pointer-events-none absolute inset-3 z-[6] grid place-items-center rounded-xl border-2 border-dashed border-primary bg-primary-soft/90">
              <div className="flex flex-col items-center gap-1.5 p-5 text-center text-primary">
                <CloudUploadIcon className="size-[30px]" />
                <div className="text-[15px] font-semibold text-foreground">
                  {atLeaf ? `Suelta para subir a «${currentNode!.name}»` : "Solo las clases admiten archivos"}
                </div>
                <div className="max-w-[40ch] text-[12.5px] text-muted">
                  {atLeaf
                    ? `Validaremos el tamaño (máx. ${fmtBytes(MAX_FILE_BYTES)}) antes de subir.`
                    : "Entra a una clase (nodo hoja) para poder subir archivos."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* modales */}
      {modal?.type === "node" && (
        <NodeDialog
          mode={modal.mode}
          level={modal.level}
          parent={modal.parent}
          node={modal.node}
          siblingCount={children.length}
          loading={busy}
          error={dialogError}
          onClose={closeModal}
          onSubmit={saveNode}
        />
      )}
      {modal?.type === "del-node" && (
        <DeleteNodeDialog
          node={modal.node}
          level={modal.level}
          cascade={modal.cascade}
          loading={busy}
          error={dialogError}
          onClose={closeModal}
          onConfirm={confirmDeleteNode}
        />
      )}
      {modal?.type === "upload" && currentNode && (
        <UploadDialog
          node={currentNode}
          initial={modal.initial}
          loading={busy}
          error={dialogError}
          onClose={closeModal}
          onUpload={doUpload}
        />
      )}
      {modal?.type === "download" && (
        <DownloadDialog
          file={modal.file}
          onRequestLink={() => mutations.requestLink(modal.file)}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

/** Estado hueco reutilizable (icono + título + descripción + acción). */
function Hollow({
  icon,
  title,
  desc,
  children,
}: {
  icon: ReactNode
  title: string
  desc: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed border-border bg-background px-6 py-[52px] text-center">
      <span className="mb-1 grid size-[52px] place-items-center rounded-[14px] bg-surface text-muted">{icon}</span>
      <div className="text-[15px] font-semibold">{title}</div>
      <div className="mb-1.5 max-w-[46ch] text-[13px] leading-normal text-muted text-pretty">{desc}</div>
      {children}
    </div>
  )
}
