import { EstudiantesScreen } from "@/components/estudiantes/estudiantes-screen"
import { courses, perms, students } from "@/data/estudiantes-stub"

/**
 * Sección Estudiantes y cursos (`/dashboard/estudiantes`). Container: inyecta los
 * datos stub que en producción vendrán de MS-Student / MS-Course y de la sesión.
 */
export function EstudiantesPage() {
  return <EstudiantesScreen students={students} courses={courses} perms={perms} />
}
