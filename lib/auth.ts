import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'
import { withRetry } from './db-helper'

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-mude-em-producao'

// Interface para compatibilidade
export interface User {
  id: string
  name: string
  email: string
  cpf: string
  password: string
  plan: 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos'
  credits?: number
  createdAt: Date
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    return decoded
  } catch {
    return null
  }
}

export function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function createUser(name: string, email: string, cpf: string, password: string): Promise<User> {
  // Verificar se email já existe
  const existingEmail = await withRetry(() =>
    prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
  )
  if (existingEmail) {
    throw new Error('Email já está em uso')
  }

  // Verificar se CPF já existe
  const cleanCPF = cpf.replace(/[^\d]/g, '')
  const existingCPF = await withRetry(() =>
    prisma.user.findUnique({
      where: { cpf: cleanCPF }
    })
  )
  if (existingCPF) {
    throw new Error('CPF já está cadastrado')
  }

  const hashedPassword = await hashPassword(password)
  
  const user = await withRetry(() =>
    prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        cpf: cleanCPF,
        password: hashedPassword,
        plan: 'Gratuito',
      }
    })
  )

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    password: user.password,
    plan: user.plan as 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos',
    credits: user.credits || undefined,
    createdAt: user.createdAt
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await withRetry(() =>
    prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
  )

  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    password: user.password,
    plan: user.plan as 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos',
    credits: user.credits || undefined,
    createdAt: user.createdAt
  }
}

export async function findUserById(id: string): Promise<User | null> {
  const user = await withRetry(() =>
    prisma.user.findUnique({
      where: { id }
    })
  )

  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    password: user.password,
    plan: user.plan as 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos',
    credits: user.credits || undefined,
    createdAt: user.createdAt
  }
}

export async function getAllUsers(): Promise<User[]> {
  const users = await withRetry(() =>
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
  )

  return users.map((user: { id: string; name: string; email: string; cpf: string; password: string; plan: string; credits: number | null; createdAt: Date }) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    password: user.password,
    plan: user.plan as 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos',
    credits: user.credits || undefined,
    createdAt: user.createdAt
  }))
}

export async function validateLogin(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email)
  if (!user) return null

  const isValid = await comparePassword(password, user.password)
  return isValid ? user : null
}

export async function saveResetToken(email: string, token: string): Promise<void> {
  await withRetry(async () => {
    // Remove tokens expirados
    const now = new Date()
    await prisma.resetToken.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    })
    
    // Adiciona novo token (válido por 1 hora)
    await prisma.resetToken.create({
      data: {
        token,
        email: email.toLowerCase(),
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000) // 1 hora
      }
    })
  })
}

export async function validateResetToken(token: string): Promise<string | null> {
  const resetToken = await withRetry(() =>
    prisma.resetToken.findUnique({
      where: { token }
    })
  )

  if (!resetToken) return null

  if (resetToken.expiresAt < new Date()) {
    // Remove token expirado
    await withRetry(() =>
      prisma.resetToken.delete({
        where: { token }
      })
    )
    return null
  }

  return resetToken.email
}

export async function deleteResetToken(token: string): Promise<void> {
  await withRetry(() =>
    prisma.resetToken.deleteMany({
      where: { token }
    })
  )
}

export async function updateUserPassword(email: string, newPassword: string): Promise<void> {
  const user = await findUserByEmail(email)
  if (!user) throw new Error('Usuário não encontrado')

  const hashedPassword = await hashPassword(newPassword)
  await withRetry(() =>
    prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashedPassword }
    })
  )
}

export async function updateUserPlan(userId: string, plan: 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos', credits?: number): Promise<void> {
  await withRetry(() =>
    prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        credits: credits !== undefined ? credits : undefined
      }
    })
  )
}

export async function getUserPlan(userId: string): Promise<'Gratuito' | 'Mensal' | 'Anual' | 'Créditos' | null> {
  const user = await withRetry(() =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    })
  )
  return user ? (user.plan as 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos') : null
}
