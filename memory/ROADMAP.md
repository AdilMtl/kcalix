# Kcalix v3 — Plano de Execução Completo
**Data:** 2026-03-07
**Status:** Em execução
**Tipo:** Documento de referência entre sessões — leia no /start de cada sessão

---

## Como usar este documento

Este arquivo é o "manual de bordo" do projeto Kcalix v3. Cada vez que iniciar uma sessão, o `/start` lê este arquivo para identificar a fase atual e o próximo passo concreto.

---

## Visão Geral

**Produto:** SaaS PWA de nutrição + treino com autenticação, dados na nuvem (Supabase) e base para IA integrada futura.
**Sucessor de:** Kcal.ix (blocos-tracker) — app antigo permanece ativo em paralelo.

### O que NÃO muda
- Design visual: cores, dark mode, tokens CSS (`--accent: #7c5cff`, etc.)
- Lógica de cálculo: BMR, TDEE, volume muscular, JP7
- Protocolos Lucas Campos (MEV, MRV, volume cycling)
- Base de exercícios (EXERCISE_DB)
- Linguagem e UX em português brasileiro

### Repositórios e URLs
| Item | Valor |
|---|---|
| Repo novo | `AdilMtl/kcalix` → `kcalix.vercel.app` |
| Repo antigo | `adilmtl/blocos-tracker` → `adilmtl.github.io/blocos-tracker` |
| Diretório local | `Desktop/Development/kcalix/` |
| Supabase | `klvqyczfqxrbybgljnhe.supabase.co` |

---

## Stack Técnica

| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend | React + Vite | IA escreve melhor, base para React Native futuro |
| Linguagem | TypeScript | Detecta erros antes de rodar, IA mais precisa |
| Estilos | Tailwind CSS | Consistente com outro projeto, sem CSS global conflitante |
| Auth + Banco | Supabase | Free tier suficiente, RLS nativo, Auth pronta |
| Deploy | Vercel | Auto-deploy a cada push, Free tier ilimitado |

---

## Status das Fases

| Fase | Descrição | Status |
|---|---|---|
| 0 | Setup do repositório | ✅ CONCLUÍDA (2026-03-07) |
| 1 | Autenticação (Google OAuth + email/senha) | Próxima |
| 2 | Home e Diário | Planejado |
| 3 | Treino | Planejado |
| 4 | Corpo, Hábitos, Mais | Planejado |
| 5 | Ferramenta de migração (exportar/importar) | Planejado |
| 6 | PWA e polish | Planejado |
| 7 | Freemium | Futuro |
| 8 | IA integrada | Futuro |

---

## FASE 0 — Setup do Repositório ✅ CONCLUÍDA

**Concluída em:** 2026-03-07

### O que foi feito
- Vite + React + TypeScript + Tailwind instalados
- `@supabase/supabase-js` e `react-router-dom` instalados
- Estrutura de pastas: `src/pages/`, `src/components/`, `src/lib/`, `src/store/`, `src/hooks/`, `src/types/`
- `src/lib/supabase.ts` e `src/lib/auth.ts` criados (aguardam chaves)
- Páginas placeholder para todas as abas
- `.env.local` com chaves do Supabase (fora do Git)
- `.gitignore` protege `.env.local`
- Repositório GitHub `AdilMtl/kcalix` criado e conectado
- Vercel publicando automaticamente a cada push
- `kcalix.vercel.app` no ar e funcionando
- Skills Claude Code criados em `.claude/commands/`

### Checklist de validação
- [x] `npm run dev` roda sem erros
- [x] Push para GitHub funciona
- [x] Vercel faz deploy automático
- [x] `.env.local` NÃO aparece no GitHub

---

## FASE 1 — Autenticação
**Estimativa:** 1-2 sessões
**Pré-requisito:** Fase 0 ✅

### Parte A — Você faz no browser (antes de iniciar o código)
1. No Supabase: **Authentication → Providers → Google** → ativar
2. No Google Cloud Console: criar credenciais OAuth 2.0
   - Tipo: Web application
   - Authorized redirect URIs: `https://klvqyczfqxrbybgljnhe.supabase.co/auth/v1/callback`
3. Colar Client ID e Client Secret no Supabase
4. No Supabase: **Authentication → URL Configuration** → adicionar `https://kcalix.vercel.app` em Site URL e Redirect URLs
5. No Supabase SQL Editor: executar o SQL de criação de tabelas e políticas RLS (ver abaixo)

### Parte B — Claude Code faz
1. `src/store/authStore.ts` — estado global: usuário atual, loading, erro
2. `src/pages/LoginPage.tsx` — tela de login com visual Kcalix (dark, roxo, DM Sans)
3. `src/App.tsx` — roteador: logado → dashboard; não logado → LoginPage
4. `src/components/Nav.tsx` — barra inferior com 5 abas
5. Testar fluxo completo: login → dashboard → logout → login de novo

### SQL para executar no Supabase (copiar no SQL Editor)
```sql
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome       TEXT,
  plano      TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE diary_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date       DATE NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE TABLE workouts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date       DATE NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workout_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE body_measurements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date       DATE NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE habits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE checkins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date       DATE NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE custom_exercises (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS automático já ativado pelo Supabase (Enable automatic RLS foi marcado)
-- Policies:
CREATE POLICY "user_owns_data" ON profiles
  FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY "user_owns_data" ON user_settings
  FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_data" ON diary_entries
  FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_data" ON workouts
  FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_data" ON workout_templates
  FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_data" ON body_measurements
  FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_data" ON habits
  FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_data" ON checkins
  FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_owns_data" ON custom_exercises
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Trigger: cria perfil automaticamente ao registrar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Checklist de validação
- [ ] Login com Google funciona no celular real
- [ ] Login com email/senha funciona
- [ ] Sessão persiste após fechar e reabrir o browser
- [ ] Logout funciona
- [ ] Tabela `profiles` recebe nova linha ao primeiro login
- [ ] Console sem erros de CORS ou autenticação

---

## FASE 2 — Home e Diário
**Estimativa:** 2-3 sessões
**Pré-requisito:** Fase 1 concluída

### Sessão 2A — HomePage
- Dashboard de energia (BMR, TDEE, consumido, saldo)
- Card de hábitos
- Gráfico semanal de energia
- Conectar a `user_settings` e `diary_entries` no Supabase

### Sessão 2B — DiárioPage + FoodDrawer
- Estrutura de refeições (café, almoço, jantar, snacks)
- FoodDrawer completo (busca, categorias, recentes)
- Custom foods e mini-modal de porção
- Persistência em `diary_entries` (ler/salvar por dia)
- Testar multi-dispositivo

### Sessão 2C (se necessária)
- Comportamento offline (cache)
- Supabase Realtime (sync em tempo real)

---

## FASE 3 — Treino
**Estimativa:** 2-3 sessões
**Pré-requisito:** Fase 2 concluída

### Sessão 3A — Estrutura base
- TreinoPage com lista e botão novo treino
- Templates (rotinas) e grid de seleção
- ExerciseSelector (abas por grupo muscular)
- Persistência em `workouts` e `workout_templates`

### Sessão 3B — Modais e histórico
- Histórico: por treino, por equipamento, volume muscular
- Analytics de volume muscular
- Exercícios customizados
- Coach Modal (5 páginas educativas)

### Sessão 3C (se necessária)
- Timer de pausa com notificações
- Edge cases e persistência durante treino ativo

---

## FASE 4 — Corpo, Hábitos e Mais
**Estimativa:** 1-2 sessões
**Pré-requisito:** Fase 3 concluída

- CorpoPage: medições, dobras, histórico de peso
- Hábitos: heatmap mensal, tendências, streak
- Check-ins: histórico periódico
- MaisPage: calculadora JP7, wizard de configuração, perfil nutricional
- Configurações de conta: nome, senha, plano

---

## FASE 5 — Ferramenta de Migração
**Estimativa:** 1 sessão
**Pré-requisito:** Fase 4 concluída

### Exportador (no blocos-tracker — modificação mínima)
- Botão "Exportar para Kcalix" lê todo o localStorage `blocos_tracker_*`
- Gera `kcalix-export.json` para download

### Importador (no Kcalix)
- Tela na primeira sessão: "Importar dados do app anterior"
- Seleciona JSON → insere nas tabelas do Supabase
- Confirmação com contagem de registros

### Mapeamento localStorage → Supabase
| localStorage key | Tabela |
|---|---|
| `blocos_tracker_settings` | `user_settings` |
| `blocos_tracker_diary` | `diary_entries` |
| `blocos_tracker_workouts` (workouts[]) | `workouts` |
| `blocos_tracker_workouts` (templates[]) | `workout_templates` |
| `blocos_tracker_corpo` | `body_measurements` |
| `blocos_tracker_habits_v1` | `habits` |
| `blocos_tracker_checkins_v1` | `checkins` |
| `blocos_tracker_custom_exercises` | `custom_exercises` |

---

## FASE 6 — PWA e Polish
**Estimativa:** 1 sessão
**Pré-requisito:** Fase 5 concluída

- `manifest.json` para Kcalix
- `vite-plugin-pwa` para service worker automático
- Testar instalação Android e iOS
- Testar comportamento offline
- Testar notificações do timer

---

## FASE 7 — Freemium (Futuro)
- Definir features Free vs Premium
- Stripe ou Lemon Squeezy para pagamento
- Guards de feature no frontend
- Gestão de assinatura

---

## FASE 8 — IA Integrada (Futuro)
- Chat com coach usando dados do Supabase
- Inserção por foto (identifica alimentos)
- Relatórios inteligentes semanais/mensais

---

## Regras Críticas do Projeto

1. **NUNCA commitar `.env.local`** — chaves do Supabase expostas = dados de todos os usuários em risco
2. **NUNCA usar `any` no TypeScript** — usar `unknown` se necessário
3. **NUNCA chamar Supabase diretamente em componentes** — sempre via hooks (`useAuth`, `useSync`, etc.)
4. **SEMPRE testar no celular real** antes de marcar fase como concluída
5. **NUNCA modificar banco diretamente** no painel — sempre via SQL em `supabase/migrations/`
6. **Manter app antigo intocado** até Fase 5 concluída e dados migrados

---

## Fluxo de Trabalho (VibeCode/SDD)

```
Iniciar sessão  → /start   (lê este ROADMAP, mostra fase atual)
Planejar        → /spec    (especifica antes de codar)
Implementar     → /feature ou /fix ou /improve
Revisar         → /review  (checklist TypeScript + Supabase + mobile)
Encerrar        → /end     (CHANGELOG + commit + push + atualiza ROADMAP)
```

Troque de sessão quando:
- Passou de 60-90 min de trabalho intenso
- Terminou uma fase ou sub-sessão
- Ocorreu erro difícil de resolver (contexto "poluído")
