-- =====================================================
-- Schema SQL para TraduzSum - Supabase
-- =====================================================
-- Execute este SQL no Supabase SQL Editor para criar as tabelas necessárias
-- Link: https://supabase.com/dashboard/project/_/sql

-- =====================================================
-- Tabela: User
-- Armazena informações dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "cpf" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "plan" TEXT NOT NULL DEFAULT 'Gratuito',
  "credits" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_cpf_idx" ON "User"("cpf");

-- =====================================================
-- Tabela: ResetToken
-- Armazena tokens de recuperação de senha
-- =====================================================
CREATE TABLE IF NOT EXISTS "ResetToken" (
  "id" TEXT PRIMARY KEY,
  "token" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS "ResetToken_token_idx" ON "ResetToken"("token");
CREATE INDEX IF NOT EXISTS "ResetToken_email_idx" ON "ResetToken"("email");

-- Função para atualizar automaticamente o campo updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updatedAt na tabela User
CREATE TRIGGER update_user_updated_at 
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comentários nas tabelas (opcional)
-- =====================================================
COMMENT ON TABLE "User" IS 'Tabela de usuários do TraduzSum';
COMMENT ON TABLE "ResetToken" IS 'Tabela de tokens para recuperação de senha';

COMMENT ON COLUMN "User"."plan" IS 'Plano do usuário: Gratuito, Mensal, Anual, Créditos';
COMMENT ON COLUMN "User"."credits" IS 'Créditos disponíveis (para plano de créditos)';
COMMENT ON COLUMN "ResetToken"."expiresAt" IS 'Data e hora de expiração do token';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Após executar este script:
-- 1. As tabelas User e ResetToken estarão criadas
-- 2. Os índices estarão criados para melhor performance
-- 3. O trigger de updatedAt estará funcionando
-- =====================================================

