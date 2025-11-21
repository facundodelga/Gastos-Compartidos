'use server'

import { expenseSchema, groupFieldsSchema, loginSchema, registerSchema } from '@/lib/validations'

type ServerActionResult =
  | { success: true }
  | { success: false; error: string }

const getFirstError = (error: unknown) => {
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues?: { message: string }[] }).issues
    if (issues && issues.length > 0) {
      return issues[0].message
    }
  }
  return 'Datos inválidos'
}

export async function validateLoginAction(payload: { email: string; password: string }): Promise<ServerActionResult> {
  const parsed = loginSchema.safeParse(payload)
  if (!parsed.success) {
    return { success: false, error: getFirstError(parsed.error) }
  }
  return { success: true }
}

export async function validateRegisterAction(payload: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): Promise<ServerActionResult> {
  const parsed = registerSchema.safeParse(payload)
  if (!parsed.success) {
    return { success: false, error: getFirstError(parsed.error) }
  }
  return { success: true }
}

export async function validateExpenseAction(payload: { description: string; amount: string }): Promise<ServerActionResult> {
  const parsed = expenseSchema.safeParse({
    description: payload.description,
    amount: Number(payload.amount),
  })
  if (!parsed.success) {
    return { success: false, error: getFirstError(parsed.error) }
  }
  return { success: true }
}

export async function validateGroupFieldsAction(payload: {
  name: string
  members: { id: string; name: string }[]
}): Promise<ServerActionResult> {
  const parsed = groupFieldsSchema.safeParse({
    name: payload.name,
    members: payload.members,
  })

  if (!parsed.success) {
    return { success: false, error: getFirstError(parsed.error) }
  }

  return { success: true }
}

