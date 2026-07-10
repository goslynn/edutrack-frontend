import { BookOpenIcon, ChevronRightIcon, FolderIcon, FolderOpenIcon } from "lucide-react"

import type { ContentNode } from "@/types/contenidos"
import { cn } from "@/lib/utils"

interface TreeNodeProps {
  node: ContentNode
  depth: number
  activeId: string | null
  expanded: Set<string>
  childrenOf: (parentId: string | null) => ContentNode[]
  isLeaf: (node: ContentNode) => boolean
  onSelect: (node: ContentNode, depth: number) => void
  onToggle: (id: string) => void
}

/** Fila recursiva del árbol lateral (estilo explorador de archivos). */
export function TreeNode({
  node,
  depth,
  activeId,
  expanded,
  childrenOf,
  isLeaf,
  onSelect,
  onToggle,
}: TreeNodeProps) {
  const kids = childrenOf(node.id)
  const leaf = isLeaf(node)
  const open = expanded.has(node.id)
  const active = activeId === node.id
  const FolderGlyph = leaf ? BookOpenIcon : open ? FolderOpenIcon : FolderIcon

  return (
    <div>
      <div
        role="treeitem"
        aria-expanded={kids.length ? open : undefined}
        aria-selected={active}
        onClick={() => onSelect(node, depth)}
        style={{ paddingLeft: 8 + depth * 15 }}
        className={cn(
          "flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-2 text-[13px] font-medium transition-colors",
          active ? "bg-primary-soft font-semibold text-primary" : "text-muted hover:bg-background hover:text-foreground"
        )}
      >
        <button
          type="button"
          aria-label={open ? "Contraer" : "Expandir"}
          onClick={(e) => {
            e.stopPropagation()
            if (kids.length) onToggle(node.id)
          }}
          className={cn(
            "grid size-4 flex-none place-items-center rounded-sm text-muted",
            kids.length ? "cursor-pointer" : "cursor-default"
          )}
        >
          {kids.length > 0 && (
            <ChevronRightIcon className={cn("size-3.5 transition-transform", open && "rotate-90")} />
          )}
        </button>
        <span className={cn("inline-flex flex-none", active ? "text-primary" : "text-muted")}>
          <FolderGlyph className="size-[15px]" />
        </span>
        <span className="truncate">{node.name}</span>
      </div>
      {open && kids.length > 0 && (
        <div role="group">
          {kids.map((k) => (
            <TreeNode
              key={k.id}
              node={k}
              depth={depth + 1}
              activeId={activeId}
              expanded={expanded}
              childrenOf={childrenOf}
              isLeaf={isLeaf}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
