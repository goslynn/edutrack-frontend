import { ReportesScreen } from "@/components/reportes/reportes-screen"
import { useReportes } from "@/hooks/useReportes"

/**
 * Sección Reportes (`/dashboard/reportes`). Cablea el hook de feature
 * (`useReportes` → BFF → MS-Report) a la capa visual (`ReportesScreen`), que
 * es puramente presentacional.
 */
export function ReportesPage() {
  const {
    definitions,
    loading,
    error,
    perms,
    getDefinitionDetail,
    run,
    executions,
    executionsLoading,
    loadExecutions,
  } = useReportes()

  return (
    <ReportesScreen
      definitions={definitions}
      perms={perms}
      loading={loading}
      error={error}
      getDetail={getDefinitionDetail}
      onRun={run}
      executions={executions}
      executionsLoading={executionsLoading}
      onOpenHistorial={loadExecutions}
    />
  )
}
