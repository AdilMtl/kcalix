# Kcalix — Memória do Projeto

## Identidade
- **Nome:** Kcalix
- **Tipo:** SaaS PWA — nutrição + treino
- **Stack:** React + Vite + TypeScript + Tailwind + Supabase + Vercel
- **URL:** https://kcalix.vercel.app
- **GitHub:** https://github.com/AdilMtl/kcalix
- **Supabase:** https://klvqyczfqxrbybgljnhe.supabase.co
- **Diretório local:** `Desktop/Development/kcalix/`

## Projeto original (paralelo, intocado)
- **Nome:** Kcal.ix (blocos-tracker)
- **URL:** https://adilmtl.github.io/blocos-tracker/
- **Diretório:** `Desktop/Development/blocos-tracker/`
- **Regra:** NUNCA modificar o blocos-tracker até a Fase 5 estar concluída

## Fase atual
- **Fase 0:** ✅ CONCLUÍDA (2026-03-07)
- **Fase 1:** ✅ CONCLUÍDA (2026-03-07) — autenticação email/senha + admin panel
- **Fase 2:** ✅ CONCLUÍDA (2026-03-08) — código completo; pendências dependem de Fases 3 e 4
- **Fase 3:** TreinoPage — PRÓXIMA
- **Roadmap completo:** `memory/ROADMAP.md`
- **Contexto técnico do port:** `memory/contexto-port.md` — leia antes de qualquer Fase 2+

## Convenções críticas
1. NUNCA commitar `.env.local` (chaves Supabase)
2. NUNCA usar `any` no TypeScript
3. NUNCA chamar Supabase diretamente em componentes — sempre via hooks
4. SEMPRE testar no celular real antes de concluir uma fase
5. Mudanças no banco → arquivo SQL em `supabase/migrations/`
6. Deploy = push para GitHub → Vercel publica automaticamente (~1 min)

## Fluxo de sessão
```
/start → /spec → /feature|/fix|/improve → /review → /end
```
- `/end` faz CHANGELOG + commit + push (principal)
- `/deploy` só para publicações rápidas mid-session

## Estrutura de pastas principal
```
src/
├── lib/        ← supabase.ts, auth.ts
├── store/      ← estado global (authStore, diarioStore, etc.)
├── pages/      ← uma página por aba (Login, Home, Diario, Treino, Corpo, Mais)
├── components/ ← Nav, Modal, BottomSheet, FoodDrawer, ui/
├── hooks/      ← useAuth, useSync, useDiary, useWorkout, useMuscleVolume
└── types/      ← tipos TypeScript (auth, diary, workout, body)
```

## Tokens de design (preservados do app original)
- `--accent: #7c5cff` (roxo principal)
- `--bg: #0a0e18` (fundo escuro)
- `--good: #34d399` / `--warn: #fbbf24` / `--bad: #f87171`
- Font: DM Sans

## Ambiente
- Node/npm disponíveis
- `npm run dev` → localhost:5173
- `npm run build` → verificar antes de qualquer deploy
- Shell: bash (Windows com Git Bash)
