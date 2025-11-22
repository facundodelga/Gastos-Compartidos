import { z } from 'zod'

const requiredString = (field: string) =>
  z
    .string({ required_error: `${field} es requerido` })
    .trim()
    .min(1, `${field} es requerido`)

const maxString = (field: string, max: number) =>
  requiredString(field).max(max, `${field} no puede superar ${max} caracteres`)

export const loginSchema = z.object({
  email: requiredString('El email').email('El email no tiene un formato válido'),
  password: requiredString('La contraseña').min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z
  .object({
    name: requiredString('El nombre').max(120, 'El nombre no puede superar 120 caracteres'),
    email: requiredString('El email').email('El email no tiene un formato válido'),
    password: requiredString('La contraseña').min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: requiredString('La confirmación de contraseña').min(6, 'La confirmación debe tener al menos 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export const registerPayloadSchema = z.object({
  name: requiredString('El nombre').max(120, 'El nombre no puede superar 120 caracteres'),
  email: requiredString('El email').email('El email no tiene un formato válido'),
  password: requiredString('La contraseña').min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

// Validador de cantidad de dígitos: cuenta todos los dígitos numéricos (entero + decimales)
// y permite hasta 20 dígitos en total.
const amountDigitsValidator = (value: number) => {
  if (!Number.isFinite(value)) return false
  // Convertir a string y quitar signo, puntos, comas y cualquier carácter no numérico
  const numeric = String(value).replace('-', '').replace('.', '').replace(',', '').replace(/[^0-9]/g, '')
  return numeric.length <= 20
}

export const expenseSchema = z.object({
  description: requiredString('La descripción').max(256, 'La descripción no puede superar 256 caracteres'),
  amount: z
    .number({ invalid_type_error: 'El importe es requerido' })
    .refine((value) => value >= 0, { message: 'El importe no puede ser negativo' })
    .refine(amountDigitsValidator, { message: 'El importe no puede superar 20 dígitos' }),
})

export const groupMemberSchema = z.object({
  id: requiredString('El id del miembro'),
  name: maxString('El nombre del miembro', 30),
})

export const groupFieldsSchema = z.object({
  name: maxString('El nombre del grupo', 30),
  members: z.array(groupMemberSchema).min(2, 'El grupo debe tener al menos 2 miembros'),
})

export const groupCreationSchema = groupFieldsSchema
  .extend({
    id: requiredString('El id del grupo'),
    baseCurrency: requiredString('La moneda base'),
    ownerId: requiredString('El ownerId'),
    createdAt: requiredString('La fecha de creación'),
  })
  .passthrough()

export type ValidationResult =
  | { success: true }
  | { success: false; error: string }