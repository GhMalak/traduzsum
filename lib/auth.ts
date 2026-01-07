import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-mude-em-producao'

// Mock de banco de dados em memória (em produção usar banco real)
interface User {
  id: string
  name: string
  email: string
  cpf: string
  password: string
  plan: 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos'
  credits?: number
  createdAt: Date
}

interface ResetToken {
  token: string
  email: string
  expiresAt: Date
}

// Armazenamento em memória (substituir por banco de dados em produção)
const users: User[] = []
const resetTokens: ResetToken[] = []

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
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
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email já está em uso')
  }

  // Verificar se CPF já existe
  const cleanCPF = cpf.replace(/[^\d]/g, '')
  if (users.find(u => u.cpf === cleanCPF)) {
    throw new Error('CPF já está cadastrado')
  }

  const hashedPassword = await hashPassword(password)
  const user: User = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    cpf: cleanCPF,
    password: hashedPassword,
    plan: 'Gratuito',
    createdAt: new Date()
  }

  users.push(user)
  return user
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function findUserById(id: string): Promise<User | null> {
  return users.find(u => u.id === id) || null
}

export async function validateLogin(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email)
  if (!user) return null

  const isValid = await comparePassword(password, user.password)
  return isValid ? user : null
}

export function saveResetToken(email: string, token: string): void {
  // Remove tokens expirados
  const now = new Date()
  const validTokens = resetTokens.filter(t => t.expiresAt > now)
  
  // Adiciona novo token (válido por 1 hora)
  validTokens.push({
    token,
    email: email.toLowerCase(),
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000) // 1 hora
  })

  resetTokens.length = 0
  resetTokens.push(...validTokens)
}

export function validateResetToken(token: string): string | null {
  const resetToken = resetTokens.find(t => t.token === token)
  if (!resetToken) return null

  if (resetToken.expiresAt < new Date()) {
    // Remove token expirado
    const index = resetTokens.indexOf(resetToken)
    resetTokens.splice(index, 1)
    return null
  }

  return resetToken.email
}

export function deleteResetToken(token: string): void {
  const index = resetTokens.findIndex(t => t.token === token)
  if (index !== -1) {
    resetTokens.splice(index, 1)
  }
}

export async function updateUserPassword(email: string, newPassword: string): Promise<void> {
  const user = await findUserByEmail(email)
  if (!user) throw new Error('Usuário não encontrado')

  user.password = await hashPassword(newPassword)
}

export function updateUserPlan(userId: string, plan: 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos', credits?: number): void {
  const user = users.find(u => u.id === userId)
  if (user) {
    user.plan = plan
    if (credits !== undefined) {
      user.credits = credits
    }
  }
}

export function getUserPlan(userId: string): 'Gratuito' | 'Mensal' | 'Anual' | 'Créditos' | null {
  const user = users.find(u => u.id === userId)
  return user ? user.plan : null
}

