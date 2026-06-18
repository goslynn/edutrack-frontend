import { useEffect, useState } from "react"
import {
  AlertTriangleIcon,
  ClipboardCheckIcon,
  LockIcon,
  PlayIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react"

import type { AsistenciaData, AttStatus, AttSummary, Marks } from "@/types/asistencia"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Modal } from "./att-modal"
import { DOT_BG } from "./att-status"
import { freshMarks, nowTime, summ } from "./att-derive"
import { AsistenciaResumen } from "./asistencia-resumen"
import { AsistenciaSesion } from "./asistencia-sesion"
import { AsistenciaRegistrada } from "./asistencia-registrada"
import { RecordViewer } from "./record-viewer"

/** Registro que abre el visor de solo lectura. */
export interface RecordView {
  title: string
  sub: string
  by: string
  time: string
  marks: Marks
  summary: AttSummary
}

interface Session {
  state: "open" | "registered"
  marks: Marks
  time: string | null
  /** UUID de la sesión abierta en MS-Attendance. Presente cuando la API está cableada. */
  apiId: string | null
}

interface AsistenciaScreenProps {
  /** Curso en contexto (del selector del topbar). */
  courseName: string
  /** Bundle de datos de la pantalla (en producción, de los MS vía hooks). */
  data: AsistenciaData
  /** Indica que los datos están cargando (muestra estado de espera en el hero). */
  loading?: boolean
  /** Error de carga inicial. */
  error?: string | null
  /**
   * Abre una sesión en MS-Attendance. Devuelve el sessionId o lanza un error.
   * Si no se pasa, el flujo de apertura es solo local (modo stub).
   */
  onOpenSession?: () => Promise<string>
  /**
   * Cierra la sesión enviando los registros y haciendo PATCH /close.
   * Devuelve `null` en éxito o el mensaje de error.
   */
  onCloseSession?: (sessionId: string, marks: Marks) => Promise<string | null>
}

const STORAGE_KEY = "et-asist-state-v1"

interface Persisted {
  view?: "resumen" | "sesion"
  session?: Session | null
}

function loadState(): Persisted {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Persisted
  } catch {
    return {}
  }
}

/**
 * Contenedor de Asistencia: orquesta el flujo de tres hitos (resumen → sesión →
 * registrada) y los modales confirmadores. Los permisos llegan en `data.perms`
 * como estado por acción enabled/disabled/hidden (la única expresión de RBAC).
 *
 * El cierre de sesión solo muta estado local de UI; en producción ese hito
 * invoca un servicio inyectado (la capa visual nunca llama HTTP).
 */
export function AsistenciaScreen({
  courseName,
  data,
  loading,
  error,
  onOpenSession,
  onCloseSession,
}: AsistenciaScreenProps) {
  const saved = loadState()
  const [view, setView] = useState<"resumen" | "sesion">(
    saved.view === "sesion" ? "sesion" : "resumen"
  )
  const [session, setSession] = useState<Session | null>(saved.session ?? null)
  const [modal, setModal] = useState<null | "open" | "close" | "discard">(null)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [viewer, setViewer] = useState<RecordView | null>(null)

  const perms = data.perms
  const registered =
    session && session.state === "registered"
      ? { marks: session.marks, time: session.time as string }
      : null

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ view, session }))
  }, [view, session])

  // ① INICIO — confirmar y abrir sesión (todos presentes)
  const confirmOpen = async () => {
    setSaving(true)
    setApiError(null)
    try {
      const apiId = onOpenSession ? await onOpenSession() : null
      setSession({ state: "open", marks: freshMarks(data.students), time: null, apiId })
      setView("sesion")
      setModal(null)
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Error al abrir la sesión")
    } finally {
      setSaving(false)
    }
  }
  // ③ CIERRE — confirmar, enviar registros y cerrar sesión
  const confirmClose = async () => {
    if (!session) return
    setSaving(true)
    setApiError(null)
    const errMsg = onCloseSession && session.apiId
      ? await onCloseSession(session.apiId, session.marks)
      : null
    if (errMsg) {
      setApiError(errMsg)
      setSaving(false)
      return
    }
    setSession((s) => (s ? { ...s, state: "registered", time: nowTime() } : s))
    setSaving(false)
    setModal(null)
  }
  // descartar sesión abierta
  const confirmDiscard = () => {
    setSession(null)
    setView("resumen")
    setModal(null)
  }

  const setMark = (n: number, v: AttStatus) =>
    setSession((s) => (s ? { ...s, marks: { ...s.marks, [n]: v } } : s))
  const allPresent = () =>
    setSession((s) => (s ? { ...s, marks: freshMarks(data.students) } : s))

  let body
  if (loading) {
    body = (
      <div className="flex h-64 items-center justify-center text-[13.5px] text-muted">
        Cargando asistencia…
      </div>
    )
  } else if (error) {
    body = (
      <div className="flex h-64 items-center justify-center text-[13.5px] text-danger">
        {error}
      </div>
    )
  } else if (view === "sesion" && session && session.state === "open") {
    body = (
      <AsistenciaSesion
        courseName={courseName}
        data={data}
        marks={session.marks}
        onSetMark={setMark}
        onAllPresent={allPresent}
        onDiscard={() => setModal("discard")}
        onClose={() => setModal("close")}
      />
    )
  } else if (view === "sesion" && registered) {
    body = (
      <AsistenciaRegistrada
        courseName={courseName}
        data={data}
        registered={registered}
        onView={setViewer}
        onBack={() => setView("resumen")}
      />
    )
  } else {
    body = (
      <AsistenciaResumen
        perms={perms}
        courseName={courseName}
        data={data}
        registered={registered}
        onStart={() => setModal("open")}
        onView={setViewer}
      />
    )
  }

  const closeSummary = session ? summ(session.marks, data.students.length) : null

  return (
    <>
      {body}

      {/* ① modal confirmador — INICIO */}
      {modal === "open" && (
        <Modal
          icon={ClipboardCheckIcon}
          tone="primary"
          title="Iniciar toma de asistencia"
          sub={`${courseName} · ${data.today.dateLabel}`}
          onClose={() => { setModal(null); setApiError(null) }}
          foot={
            <div className="flex items-center justify-end gap-2.5">
              <Button variant="ghost" onClick={() => { setModal(null); setApiError(null) }} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={() => void confirmOpen()} disabled={saving}>
                <PlayIcon /> {saving ? "Abriendo…" : "Iniciar sesión"}
              </Button>
            </div>
          }
        >
          {apiError && (
            <p className="mb-3 rounded-md bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
              {apiError}
            </p>
          )}
          <p className="mb-3.5 text-[13.5px] leading-normal text-balance">
            Se abrirá una <b>sesión de asistencia</b> para esta clase. Todos los
            estudiantes parten como <b>presentes</b>; marcarás las novedades y
            registrarás al finalizar.
          </p>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {[
              ["Curso", courseName],
              ["Fecha", data.today.dateLabel],
              ["Bloque", data.course.block],
              ["Estudiantes", String(data.students.length)],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-[3px] bg-background px-3.5 py-[11px]">
                <span className="text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">
                  {k}
                </span>
                <span className="text-[13.5px] font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ③ modal confirmador — CIERRE (irreversible) */}
      {modal === "close" && closeSummary && (
        <Modal
          icon={LockIcon}
          tone="primary"
          title="Registrar asistencia del día"
          sub={`${courseName} · ${data.today.dateLabel}`}
          onClose={() => { setModal(null); setApiError(null) }}
          foot={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-danger">
                <AlertTriangleIcon className="size-3.5" /> Esta acción no se puede
                deshacer.
              </span>
              <span className="flex items-center gap-2.5">
                <Button variant="ghost" onClick={() => { setModal(null); setApiError(null) }} disabled={saving}>
                  Volver
                </Button>
                <Button onClick={() => void confirmClose()} disabled={saving}>
                  <SendIcon /> {saving ? "Guardando…" : "Registrar asistencia"}
                </Button>
              </span>
            </div>
          }
        >
          {apiError && (
            <p className="mb-3 rounded-md bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
              {apiError}
            </p>
          )}
          <p className="mb-3 text-[13.5px] leading-normal text-balance">
            Vas a <b>cerrar la sesión</b> y enviar la asistencia al libro de clases.
            Una vez registrada, <b>no podrá modificarse</b> — solo consultarse.
          </p>
          <div className="mb-3 grid grid-cols-1 gap-x-[18px] gap-y-2.5 rounded-lg bg-surface px-4 py-3.5 sm:grid-cols-2">
            {(
              [
                ["presente", "presentes"],
                ["atrasado", "atrasados"],
                ["ausente", "ausentes"],
                ["justificado", "justificados"],
              ] as const
            ).map(([k, label]) => (
              <div key={k} className="flex items-center gap-2 text-[13.5px]">
                <span className={cn("size-[9px] rounded-full", DOT_BG[k])} />
                <b className="tabular-nums">{closeSummary[k]}</b> {label}
              </div>
            ))}
          </div>
          <div className="text-center text-[13px] text-muted">
            <b className="text-[15px] text-foreground">{closeSummary.pct}%</b> de
            asistencia · {closeSummary.presente + closeSummary.atrasado} de{" "}
            {closeSummary.total} estuvieron en clase
          </div>
        </Modal>
      )}

      {/* descartar sesión abierta */}
      {modal === "discard" && (
        <Modal
          icon={Trash2Icon}
          tone="danger"
          title="Descartar toma de asistencia"
          onClose={() => setModal(null)}
          foot={
            <div className="flex items-center justify-end gap-2.5">
              <Button variant="ghost" onClick={() => setModal(null)}>
                Seguir editando
              </Button>
              <Button variant="destructive" onClick={confirmDiscard}>
                Descartar
              </Button>
            </div>
          }
        >
          <p className="text-[13.5px] leading-normal text-balance">
            Se cerrará la sesión <b>sin guardar</b> y los cambios se perderán. La
            asistencia de hoy quedará nuevamente como pendiente.
          </p>
        </Modal>
      )}

      {/* visor de registro (solo lectura) */}
      {viewer && (
        <RecordViewer
          rec={viewer}
          students={data.students}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  )
}
