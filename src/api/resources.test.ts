import { describe, expect, it } from 'vitest'
import type { HttpTransport } from './http-transport'
import { ok } from './result'

import { getUserById, login } from './auth'
import { closeSession, createRecord, getAsistenciaBundle, openSession } from './asistencia'
import { createAnnotation, deleteAnnotation, getAnotacionesBundle } from './anotaciones'
import {
  correctGrade,
  createEvaluation,
  deleteEvaluation,
  getCalificacionesBundle,
  getEvalBundle,
  getGradeHistory,
  registerGrade,
  updateEvaluation,
} from './calificaciones'
import {
  createCourse,
  createGuardian,
  createStudent,
  deleteCourse,
  deleteStudent,
  getEstudiantesBundle,
  listCourses,
  listGuardians,
  transferStudent,
  updateCourse,
  updateStudent,
} from './estudiantes'
import {
  assignRole,
  createRole,
  createUser,
  deleteRole,
  deleteRolePermission,
  disableUser,
  getResourceCatalog,
  listRolePermissions,
  listRoles,
  listUsers,
  revokeRole,
  updateRole,
  updateUser,
  upsertRolePermission,
} from './configuracion'

interface Call {
  method: string
  path: string
  body?: unknown
  options?: unknown
}

function recorder() {
  const calls: Call[] = []
  const ret = Promise.resolve(ok(undefined))
  const client = {
    get: (path: string, options?: unknown) => { calls.push({ method: 'GET', path, options }); return ret },
    delete: (path: string, options?: unknown) => { calls.push({ method: 'DELETE', path, options }); return ret },
    post: (path: string, body?: unknown, options?: unknown) => { calls.push({ method: 'POST', path, body, options }); return ret },
    put: (path: string, body?: unknown, options?: unknown) => { calls.push({ method: 'PUT', path, body, options }); return ret },
    patch: (path: string, body?: unknown, options?: unknown) => { calls.push({ method: 'PATCH', path, body, options }); return ret },
    request: () => ret,
  }
  return { client: client as unknown as HttpTransport, calls }
}

describe('auth', () => {
  it('login → POST /auth/login con credenciales', async () => {
    const { client, calls } = recorder()
    await login({ email: 'a@b.cl', password: 'p' }, client)
    expect(calls[0]).toMatchObject({ method: 'POST', path: '/auth/login', body: { email: 'a@b.cl', password: 'p' } })
  })
  it('getUserById → GET /auth/users/:id', async () => {
    const { client, calls } = recorder()
    await getUserById('u1', client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/auth/users/u1' })
  })
})

describe('asistencia', () => {
  it('getAsistenciaBundle', async () => {
    const { client, calls } = recorder()
    await getAsistenciaBundle('c1', client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/bff/asistencia/c1' })
  })
  it('openSession', async () => {
    const { client, calls } = recorder()
    await openSession('c1', 'cl1', client)
    expect(calls[0]).toMatchObject({ method: 'POST', path: '/bff/asistencia/c1/sessions', body: { classId: 'cl1' } })
  })
  it('closeSession', async () => {
    const { client, calls } = recorder()
    await closeSession('c1', 's1', client)
    expect(calls[0]).toMatchObject({ method: 'PATCH', path: '/bff/asistencia/c1/sessions/s1/close' })
  })
  it('createRecord arma el body con captureMethod', async () => {
    const { client, calls } = recorder()
    await createRecord('c1', 's1', 'st1', 'PRESENT', '2026-06-18T10:00:00', client)
    expect(calls[0]).toMatchObject({
      method: 'POST',
      path: '/bff/asistencia/c1/sessions/s1/records',
      body: { studentId: 'st1', status: 'PRESENT', captureMethod: 'MANUAL', recordedAt: '2026-06-18T10:00:00' },
    })
  })
})

describe('anotaciones', () => {
  it('getAnotacionesBundle', async () => {
    const { client, calls } = recorder()
    await getAnotacionesBundle('c1', client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/bff/anotaciones/c1' })
  })
  it('createAnnotation', async () => {
    const { client, calls } = recorder()
    const body = { studentId: 's1', type: 'POSITIVE', content: 'bien', date: '2026-06-18' }
    await createAnnotation(body, client)
    expect(calls[0]).toMatchObject({ method: 'POST', path: '/bff/anotaciones/annotations', body })
  })
  it('deleteAnnotation con responseType none', async () => {
    const { client, calls } = recorder()
    await deleteAnnotation('a1', client)
    expect(calls[0]).toMatchObject({ method: 'DELETE', path: '/bff/anotaciones/annotations/a1', options: { responseType: 'none' } })
  })
})

describe('calificaciones', () => {
  it('getCalificacionesBundle', async () => {
    const { client, calls } = recorder()
    await getCalificacionesBundle('c1', client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/bff/calificaciones/c1' })
  })
  it('getEvalBundle codifica el period en query', async () => {
    const { client, calls } = recorder()
    await getEvalBundle('c1', 'sub1', '2026-1', client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/bff/calificaciones/c1/subjects/sub1/evaluations?period=2026-1' })
  })
  it('createEvaluation', async () => {
    const { client, calls } = recorder()
    const body = { name: 'P1', evaluationDate: '2026-03-01', weight: 30, subjectId: 'sub1', period: '2026-1' }
    await createEvaluation(body, client)
    expect(calls[0]).toMatchObject({ method: 'POST', path: '/bff/calificaciones/evaluations', body })
  })
  it('updateEvaluation', async () => {
    const { client, calls } = recorder()
    await updateEvaluation('e1', { name: 'P1b' }, client)
    expect(calls[0]).toMatchObject({ method: 'PUT', path: '/bff/calificaciones/evaluations/e1', body: { name: 'P1b' } })
  })
  it('deleteEvaluation', async () => {
    const { client, calls } = recorder()
    await deleteEvaluation('e1', client)
    expect(calls[0]).toMatchObject({ method: 'DELETE', path: '/bff/calificaciones/evaluations/e1', options: { responseType: 'none' } })
  })
  it('registerGrade', async () => {
    const { client, calls } = recorder()
    await registerGrade('e1', 'st1', 5.5, client)
    expect(calls[0]).toMatchObject({ method: 'POST', path: '/bff/calificaciones/evaluations/e1/grades', body: { studentId: 'st1', score: 5.5 } })
  })
  it('correctGrade', async () => {
    const { client, calls } = recorder()
    await correctGrade('g1', 6, client)
    expect(calls[0]).toMatchObject({ method: 'PUT', path: '/bff/calificaciones/grades/g1', body: { score: 6 } })
  })
  it('getGradeHistory', async () => {
    const { client, calls } = recorder()
    await getGradeHistory('g1', client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/bff/calificaciones/grades/g1/audit' })
  })
})

describe('estudiantes', () => {
  it('getEstudiantesBundle / listCourses', async () => {
    const { client, calls } = recorder()
    await getEstudiantesBundle(client)
    await listCourses(client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/bff/estudiantes' })
    expect(calls[1]).toMatchObject({ method: 'GET', path: '/bff/estudiantes/courses' })
  })
  it('createStudent / updateStudent / deleteStudent / transferStudent', async () => {
    const { client, calls } = recorder()
    await createStudent({ rut: '1-9', firstName: 'A', lastName: 'B', birthDate: '2010-01-01', courseId: 'c1' }, client)
    await updateStudent('s1', { firstName: 'A', lastName: 'B', birthDate: '2010-01-01' }, client)
    await deleteStudent('s1', client)
    await transferStudent('s1', { courseId: 'c2' }, client)
    expect(calls[0]).toMatchObject({ method: 'POST', path: '/bff/estudiantes/students' })
    expect(calls[1]).toMatchObject({ method: 'PUT', path: '/bff/estudiantes/students/s1' })
    expect(calls[2]).toMatchObject({ method: 'DELETE', path: '/bff/estudiantes/students/s1', options: { responseType: 'none' } })
    expect(calls[3]).toMatchObject({ method: 'PATCH', path: '/bff/estudiantes/students/s1/transfer', body: { courseId: 'c2' } })
  })
  it('guardians', async () => {
    const { client, calls } = recorder()
    await listGuardians('s1', client)
    await createGuardian('s1', { firstName: 'M', lastName: 'P', email: 'm@p.cl', phone: '9', relationType: 'PARENT' }, client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/bff/estudiantes/students/s1/guardians' })
    expect(calls[1]).toMatchObject({ method: 'POST', path: '/bff/estudiantes/students/s1/guardians' })
  })
  it('courses CRUD', async () => {
    const { client, calls } = recorder()
    const body = { name: '1°A', description: '', level: '1° Medio', section: 'A', academicYear: 2026 }
    await createCourse(body, client)
    await updateCourse('c1', body, client)
    await deleteCourse('c1', client)
    expect(calls[0]).toMatchObject({ method: 'POST', path: '/bff/estudiantes/courses' })
    expect(calls[1]).toMatchObject({ method: 'PUT', path: '/bff/estudiantes/courses/c1' })
    expect(calls[2]).toMatchObject({ method: 'DELETE', path: '/bff/estudiantes/courses/c1' })
  })
})

describe('configuracion', () => {
  it('usuarios', async () => {
    const { client, calls } = recorder()
    await listUsers(client)
    await createUser({ email: 'a@b.cl', password: 'p', displayName: 'A' }, client)
    await updateUser('u1', { enabled: false }, client)
    await disableUser('u1', client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/bff/configuracion/users' })
    expect(calls[1]).toMatchObject({ method: 'POST', path: '/bff/configuracion/users' })
    expect(calls[2]).toMatchObject({ method: 'PUT', path: '/bff/configuracion/users/u1', body: { enabled: false } })
    expect(calls[3]).toMatchObject({ method: 'DELETE', path: '/bff/configuracion/users/u1', options: { responseType: 'none' } })
  })
  it('roles', async () => {
    const { client, calls } = recorder()
    await listRoles(client)
    await createRole({ name: 'Docente' }, client)
    await updateRole('r1', { name: 'Docente 2' }, client)
    await deleteRole('r1', client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/bff/configuracion/roles' })
    expect(calls[1]).toMatchObject({ method: 'POST', path: '/bff/configuracion/roles' })
    expect(calls[2]).toMatchObject({ method: 'PUT', path: '/bff/configuracion/roles/r1' })
    expect(calls[3]).toMatchObject({ method: 'DELETE', path: '/bff/configuracion/roles/r1' })
  })
  it('permisos por rol codifican el resourceKey', async () => {
    const { client, calls } = recorder()
    await listRolePermissions('r1', client)
    await upsertRolePermission('r1', 'auth.users', 6, client)
    await deleteRolePermission('r1', 'auth.users', client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/bff/configuracion/roles/r1/permissions' })
    expect(calls[1]).toMatchObject({ method: 'PUT', path: '/bff/configuracion/roles/r1/permissions/auth.users', body: { flags: 6 } })
    expect(calls[2]).toMatchObject({ method: 'DELETE', path: '/bff/configuracion/roles/r1/permissions/auth.users' })
  })
  it('catálogo de recursos y asignación de roles', async () => {
    const { client, calls } = recorder()
    await getResourceCatalog(client)
    await assignRole('u1', 'r1', client)
    await revokeRole('u1', 'r1', client)
    expect(calls[0]).toMatchObject({ method: 'GET', path: '/bff/configuracion/resources' })
    expect(calls[1]).toMatchObject({ method: 'POST', path: '/bff/configuracion/users/u1/roles/r1', options: { responseType: 'none' } })
    expect(calls[2]).toMatchObject({ method: 'DELETE', path: '/bff/configuracion/users/u1/roles/r1', options: { responseType: 'none' } })
  })
})
