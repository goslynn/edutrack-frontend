import { EstudiantesScreen } from "@/components/estudiantes/estudiantes-screen"
import { useEstudiantes } from "@/hooks/useEstudiantes"

/**
 * Sección Estudiantes y cursos (`/dashboard/estudiantes`).
 * Cablea el hook de feature (`useEstudiantes` → BFF → MS-Student / MS-Course)
 * a la capa visual (`EstudiantesScreen`), que es puramente presentacional.
 */
export function EstudiantesPage() {
  const {
    students,
    courses,
    loading,
    error,
    perms,
    createStudent,
    updateStudent,
    deleteStudent,
    transferStudent,
    createCourse,
    updateCourse,
    deleteCourse,
  } = useEstudiantes()

  return (
    <EstudiantesScreen
      students={students}
      courses={courses}
      perms={perms}
      loading={loading}
      error={error}
      onStudents={{
        create: createStudent,
        update: updateStudent,
        transfer: transferStudent,
        delete: deleteStudent,
      }}
      onCourses={{
        create: createCourse,
        update: updateCourse,
        delete: deleteCourse,
      }}
    />
  )
}
