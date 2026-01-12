import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { withPrisma } from './db'

// Remover aspas se houver (alguns arquivos .env podem ter aspas)
const JWT_SECRET = (process.env.JWT_SECRET || 'seu-secret-super-seguro-mude-em-producao')
  ?.trim()?.replace(/^["']|["']$/g, '') // Remove aspas simples ou duplas no início/fim

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
  return await withPrisma(async (prisma: PrismaClient) => {
    // Verificar se email já existe
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    if (existingEmail) {
      throw new Error('Email já está em uso')
    }

    // Verificar se CPF já existe
    const cleanCPF = cpf.replace(/[^\d]/g, '')
    const existingCPF = await prisma.user.findUnique({
      where: { cpf: cleanCPF }
    })
    if (existingCPF) {
      throw new Error('CPF já está cadastrado')
    }

    const hashedPassword = await hashPassword(password)
    
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        cpf: cleanCPF,
        password: hashedPassword,
        plan: 'Gratuito',
      }
    })

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
  })
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await withPrisma(async (prisma: PrismaClient) => {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
  })

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
  const user = await withPrisma(async (prisma: PrismaClient) => {
    return await prisma.user.findUnique({
      where: { id }
    })
  })

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
  const users = await withPrisma(async (prisma: PrismaClient) => {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
  })

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
  if (!email || !token) {
    throw new Error('Email e token são obrigatórios')
  }

  return await withPrisma(async (prisma: PrismaClient) => {
    try {
      // Remove tokens expirados
      const now = new Date()
      await prisma.resetToken.deleteMany({
        where: {
          expiresAt: {
            lt: now
          }
        }
      })
      
      // Remove tokens antigos do mesmo email (limpar tokens anteriores)
      await prisma.resetToken.deleteMany({
        where: {
          email: email.toLowerCase()
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
      
      console.log(`✅ Token de reset salvo para ${email.toLowerCase()}`)
    } catch (error: any) {
      console.error('❌ Erro ao salvar token de reset:', error)
      throw new Error(`Erro ao salvar token de recuperação: ${error.message}`)
    }
  })
}

export async function validateResetToken(token: string): Promise<string | null> {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return null
  }

  try {
    return await withPrisma(async (prisma: PrismaClient) => {
      const resetToken = await prisma.resetToken.findUnique({
        where: { token: token.trim() }
      })

      if (!resetToken) {
        console.log('❌ Token não encontrado no banco de dados')
        return null
      }

      const now = new Date()
      if (resetToken.expiresAt < now) {
        // Remove token expirado
        await prisma.resetToken.delete({
          where: { token }
        })
        console.log('❌ Token expirado')
        return null
      }

      console.log(`✅ Token válido para ${resetToken.email}`)
      return resetToken.email
    })
  } catch (error: any) {
    console.error('❌ Erro ao validar token:', error)
    return null
  }
}

export async function deleteResetToken(token: string): Promise<void> {
  await withPrisma(async (prisma: PrismaClient) => {
    await prisma.resetToken.deleteMany({
      where: { token }
    })
  })
}

export async function updateUserPassword(email: string, newPassword: string): Promise<void> {
  const user = await findUserByEmail(email)
  if (!user) throw new Error('Usuário não encontrado')

  const hashedPassword = await hashPassword(newPassword)
  await withPrisma(async (prisma: PrismaClient) => {
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashedPassword }
    })
  })
}

export async function updateUserPlan(userId: string, plan: 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos', credits?: number): Promise<void> {
  await withPrisma(async (prisma: PrismaClient) => {
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        credits: credits !== undefined ? credits : undefined
      }
    })
  })
}

export async function getUserPlan(userId: string): Promise<'Gratuito' | 'Mensal' | 'Anual' | 'Créditos' | null> {
  const user = await withPrisma(async (prisma: PrismaClient) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    })
  })
  return user ? (user.plan as 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos') : null
}
