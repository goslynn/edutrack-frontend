import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { CalendarCheckIcon, FileChartColumnIcon, GraduationCapIcon, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import wordmarkLight from '@/assets/logo/edutrack-wordmark-light.svg'

function FeatureChip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-background/12 px-3 py-1.5 text-xs text-background">
      <Icon aria-hidden className="size-3.5" />
      {children}
    </span>
  )
}

export function LoginBrandPane({ className, ...props }: ComponentPropsWithoutRef<'aside'>) {
  return (
    <aside
      className={cn(
        'relative hidden flex-col justify-between overflow-hidden bg-foreground p-12 text-background lg:flex',
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="absolute -right-[130px] -bottom-[130px] size-[380px] rounded-full bg-radial from-primary/60 to-transparent to-70%"
      />

      <img src={wordmarkLight} alt="EduTrack" className="relative z-10 h-[30px] w-auto self-start" />

      <div className="relative z-10">
        <p className="mb-3.5 text-xs font-semibold tracking-[0.08em] text-secondary uppercase">
          Libro de clases digital
        </p>
        <h2 className="mb-3.5 max-w-md text-[32px] leading-tight font-semibold tracking-tight text-balance">
          La gestión académica de tu colegio, en un solo lugar.
        </h2>
        <p className="max-w-[420px] text-[15px] leading-normal text-background/80">
          Calificaciones, asistencia y anotaciones conectadas — para que el equipo docente dedique su
          tiempo a enseñar, no a planillas.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <FeatureChip icon={GraduationCapIcon}>Calificaciones</FeatureChip>
          <FeatureChip icon={CalendarCheckIcon}>Asistencia</FeatureChip>
          <FeatureChip icon={FileChartColumnIcon}>Reportes</FeatureChip>
        </div>
      </div>
    </aside>
  )
}
