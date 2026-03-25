# Changelog — Kcalix

---

## [0.50.0] — 2026-03-24

### Melhorado
- [improve] `src/components/AiChatModal.tsx` — estado vazio do chat reformulado: pool de 12 chips (nutrição/treino/corpo/registro) com 3 sorteados aleatoriamente a cada abertura; chips de registro preenchem o input com placeholder e focam o teclado em vez de enviar direto (evita log vazio acidental)
- [improve] `src/components/AiChatModal.tsx` — bloco "Também posso..." fixo no estado vazio listando as 4 capacidades do coach (foto, registro por texto, diagnóstico, sugestões)
- [improve] `src/components/AiChatModal.tsx` — feedback visual ao enviar foto: bolha do usuário com miniatura + barra de progresso pulsante; bolha do coach "🔍 Identificando alimentos..." com 3 dots; header subtitle "Analisando foto..."
- [fix] `src/components/AiChatModal.tsx` — scroll automático ao iniciar upload de foto: `photoLoading` adicionado na dep do `useEffect` + `setTimeout(50ms)` para aguardar render das bolhas antes do scroll

### Notas
- Bug flash Android galeria documentado no roadmap com histórico completo de tentativas — todas as abordagens frontend falharam; opção futura é Capacitor (wrapper nativo)
- Fase 7 encerrada como estável — refinamentos de UX contínuos conforme uso real

---

## [0.49.0] — 2026-03-24

### Corrigido
- [fix] `src/components/AiChatModal.tsx` — guard `visibilitychange` no Android: congela `setPhotoResult` enquanto `document.hidden === true` (WebView suspenso ao abrir galeria), aplica resultado ao voltar ao foco via `pendingPhotoResultRef` — elimina piscar da tela ao carregar foto da galeria
- [fix] `src/components/PhotoReviewSheet.tsx` — alimentos adicionados manualmente (checklist "ingredientes ocultos" e campo livre) agora estimam macros via Edge Function `parse-food`; item aparece imediatamente com badge ⏳ e macros preenchem em ~1-2s; fallback ⚠️ se chamada falhar

### Adicionado
- [feat] `src/hooks/useAiChat.ts` — `estimateFoodMacros(nome)`: função standalone que chama `parse-food` com `foodIndex:''` (força estimativa TACO/IBGE); sem alteração de deploy na Edge Function

### Notas
- Edge Function: sem mudança, sem redeploy necessário
- Bug 1 (flash Android) requer teste em dispositivo físico — não reproduzível no desktop

---

## [0.48.0] — 2026-03-24

### Adicionado
- [feat] `src/lib/imageUtils.ts` — `resizeImageToBase64()`: redimensiona foto para max 800px, JPEG qualidade 0.7, retorna base64 + sizeKB; alvo < 200KB para minimizar custo de tokens Vision
- [feat] `src/components/PhotoReviewSheet.tsx` — tela de review de foto: lista editável de alimentos detectados, badge ⚠️ com alternativas inline para itens com confidence < 0.70, checklist fixo de ingredientes ocultos (molho, recheio, tempero), fallback amigável quando nenhum alimento é identificado, botão "Descrever por texto" como saída
- [feat] `src/hooks/useAiChat.ts` — tipos `PhotoFoodItem`, `PhotoFoodResult`, `PhotoAltItem`; `sendPhotoToAi(base64, mimeType)` chama Edge Function com `action:'analyze-photo'`; `PendingLogItem.source` ampliado para `'db' | 'custom' | 'photo'`
- [feat] `src/components/AiChatModal.tsx` — botão 📷 no input do chat; dois `<label>+<input type="file">` separados (câmera com `capture="environment"` e galeria sem capture — padrão iOS/Safari); preview miniatura no header do sheet; photoLoading state com ⏳
- [feat] `supabase/functions/ai-chat/index.ts` — bloco `action:'analyze-photo'` isolado (mesmo padrão do `parse-food`); gpt-4o-mini Vision com `detail:"low"` (~$0.001–0.002/foto); retorna `PhotoFoodResult` com confidence e alternatives por item; sem storage — imagem apenas em memória durante o request

### Notas
- Fase 7C concluída — Fase 7 (IA Integrada) completa: 7A (chat) + 7B (log via texto) + 7C (log via foto)
- ⚠️ **Em observação** — feature nova com IA generativa; precisam de validação com uso real de usuários: acurácia de identificação, estimativa de porção, casos de ingredientes ocultos
- Edge Function deployada; tag de restauração: `v0.48.0-ai-chat-stable` (rollback em ~2 min se necessário)
- Custo estimado: ~$0.001–0.002/foto (gpt-4o-mini Vision, detail:low, imagem < 200KB)
- Próximas melhorias possíveis após validação: refinamento do prompt com casos reais, suporte a múltiplas fotos, integração com banco de dados TACO para macros mais precisos

---

## [0.47.0] — 2026-03-23

### Adicionado
- [feat] `supabase/functions/ai-chat/index.ts` — MODO LOG no system prompt: IA decide se mensagem é relato de refeição ou pergunta sobre o diário, retornando `{"action":"parse-food"}` ou `{"action":"chat","reply":"..."}` — elimina regex no frontend
- [feat] `supabase/functions/ai-chat/index.ts` — tabela de referência TACO/IBGE inline no prompt do `parseFoodHandler` (25 alimentos); alimentos `source:'custom'` agora retornam macros estimados por 100g, nunca zeros

### Corrigido
- [fix] `src/hooks/useAiChat.ts` — `hasLogIntent()` + `LOG_TRIGGERS` removidos; `sendMessage` unificado em um único fluxo; resposta interpretada via discriminated union `action:'chat' | 'parse-food'`
- [fix] `supabase/functions/ai-chat/index.ts` — match no índice exige mesmo alimento (couve ≠ couve-flor); em caso de dúvida → `source:'custom'`
- [fix] `supabase/functions/ai-chat/index.ts` — alimentos compostos (farofa de calabresa, omelete) retornados como item único com macros estimados do prato, não separados em ingredientes

### Notas
- Fase 7B concluída — log de alimentos via IA totalmente funcional
- Edge Function `ai-chat` deployada (v0.47.0); tag de restauração: `v0.45.0-ai-chat-stable`
- Ajustes de prompt são iterativos — reportar casos inesperados para refinamento

---

## [0.40.1] — 2026-03-22

### Corrigido
- [fix] `src/pages/HomePage.tsx` — WeeklyChart: barra cinza (BMR + treino) não incluía kcal de exercício no carregamento inicial da home; `workoutKcalByDate` agora é populado no mount via `useEffect` dependente de `user`, em vez de lazily ao abrir o modal de histórico

---

## [0.39.0] — 2026-03-19

### Adicionado
- [feat] `src/lib/calculators.ts` — `calcWaterGoal()`: algoritmo científico de meta de hidratação baseado em peso (EFSA 2010, 35ml/kg), sexo (IOM 2004, +300ml ♂), nível de atividade (GSSI, +0–900ml), objetivo nutricional (+200ml em cut/recomp) e BF% opcional (−5% base se elevado); retorna `WaterRecommendation` com breakdown detalhado e `confidence: high/medium/low`
- [feat] `src/hooks/useDiary.ts` — `waterMl?: number` em `DiaryData` + `addWaterMl(ml)` e `resetWaterMl()` com optimistic UI (mesmo padrão do `addFoodOptimistic`)
- [feat] `src/hooks/useSettings.ts` — `waterGoalMl?: number` em `UserSettingsData` (meta manual sobrescreve algoritmo)
- [feat] `src/pages/DiarioPage.tsx` — componente `WaterBar`: card separado no diário com barra de progresso, presets 🥛+100/+200/+300/+500ml, botão ✕ para zerar, cabeçalho clicável (▾) que expande breakdown do cálculo com fontes científicas
- [feat] `src/pages/MaisPage.tsx` — accordion "💧 Hidratação" em Nutrição: exibe meta recomendada com breakdown, campo de meta manual (500–6000ml), botão "Usar recomendação"
- [feat] `supabase/functions/ai-chat/index.ts` — agente lê `waterMl` de cada dia do diário e `waterGoalMl` das settings; detecta intenção por palavras-chave de hidratação (`água`, `hidrat`, `ml`, `litro`, `sede`)
- [test] `src/lib/__tests__/calculators.test.ts` — 11 novos casos para `calcWaterGoal`: sedentário/ativo, sexo, objetivo, BF% acima/abaixo limiar, múltiplo de 50, clamp 1500–4500, confidence

### Notas
- `waterMl` salvo em `diary_entries.data` (JSONB) — zero migration necessária
- Edge Function `ai-chat` deployada (v18); tag de restauração: `v0.38.0-ai-chat-stable`
- Widget de água não aparece na home (decisão: evitar redundância com o diário)

---

## [0.38.0] — 2026-03-19

### Adicionado
- [feat] `src/components/BodyEvolutionModal.tsx` — gráfico SVG puro de evolução corporal: 3 métricas (Peso/Cintura/BF%), tooltip por toque/hover, summary Mínimo/Máximo/Atual/Variação, estado vazio amigável
- [feat] `src/pages/CorpoPage.tsx` — botão "Ver evolução 📈" ativado (era disabled); abre BodyEvolutionModal com os dados já carregados
- [feat] `src/pages/HomePage.tsx` — botão "Evolução 📈" no ActionGrid (substituiu "Mais ⚙️"); abre BodyEvolutionModal com carregamento lazy na primeira abertura
- [feat] `src/hooks/useBody.ts` — `fetchAllBodyRows(userId)` exportada como função standalone (mesmo padrão de fetchAllWorkoutRows)

### Melhorado
- [improve] `src/pages/DiarioPage.tsx` — botão histórico virou ícone 📊 pequeno ao lado das kcal totais; botão "Adicionar alimento" ocupa largura total

### Corrigido
- [fix] `src/pages/HomePage.tsx` — WeeklyChart: barra cinza agora usa `BMR + treino do dia` em vez de meta calórica fixa; barra cinza só aparece em dias com alimento logado; projeção kg/sem usa balance correto (consumed − basalTotal)
- [fix] `src/components/WeeklyKcalModal.tsx` — mesma correção no modal histórico semanal: barra cinza e balance só calculados quando consumed > 0

### Notas
- BMR do gráfico ainda é o atual do perfil para todos os dias — spec para BMR diário por medição salva em `memory/spec-bmr-diario.md` (ITEM 6B-12)
- Débito técnico de schema `body_measurements` (JSONB → colunas) registrado no ROADMAP

---

## [0.37.0] — 2026-03-19

### Adicionado
- [feat] `src/components/DiaryHistoryModal.tsx` — histórico de dias do diário: lista lazy (365 dias), barra segmentada P/C/G proporcional ao kcal, chip de aderência ✅/⚠️/🔥, clique navega para o dia via dateStore
- [feat] `src/hooks/useDiary.ts` — `getAllDiaryRows()` lazy (query 365 dias, só dias com macros > 0)
- [feat] `src/store/dateStore.ts` — `goToDate(iso)` adicionado

### Melhorado
- [improve] `src/pages/DiarioPage.tsx` — botões [🍽️ Adicionar] e [📋 Histórico] lado a lado no card de totais
- [improve] `src/pages/HomePage.tsx` — ícone 📊 no ProgressCard abre histórico do diário (com stopPropagation); "Últimos 7 dias" remove texto do botão, fica só ícone 📊

### Notas
- DiaryHistoryModal abre tanto do DiarioPage quanto do HomePage (ProgressCard)
- Pendências: XSS em TemplateHistoryModal, toggle Free/Assinante, ITEM 11 (lentidão), Fase 7B

---

## [0.36.0] — 2026-03-19

### Corrigido
- [fix] `ExerciseSelector.tsx` — exercícios custom não apareciam nas abas de grupo; filtro agora usa `normalizeGroup()` que resolve grupos salvos sem emoji (dados migrados do app antigo)
- [fix] `ExerciseSelector.tsx` — grupo principal agora editável no rename inline (`<select>` substituiu texto estático); mudar grupo limpa automaticamente secundários incompatíveis
- [fix] `ExerciseSelector.tsx` — chips de grupos secundários no rename não respondiam ao toque; `e.stopPropagation()` adicionado para evitar captura pelo container pai
- [fix] `useCustomExercises.ts` — `renameCustomExercise` agora persiste campo `grupo` no Supabase junto com `nome` e `secundarios`

### Adicionado
- [feat] `src/lib/normalizeGroup.ts` — helper puro que resolve grupo muscular com ou sem emoji; usado no ExerciseSelector e disponível para uso futuro
- [feat] `supabase/migrations/012_normalize_custom_exercises_grupo.sql` — normaliza dados antigos no banco (9 variantes sem emoji → com emoji canônico)

### Notas
- Migration 012 já executada em produção (apenas UPDATE, sem alteração de schema)
- Pendências 6B ainda abertas: XSS em TemplateHistoryModal, toggle Free/Assinante, ITEM 11 (lentidão)
- Próxima sessão: continuar 6B ou avançar Fase 7B (log por linguagem natural)

---

## [0.34.2] — 2026-03-18

### Melhorado
- [improve] `supabase/functions/ai-chat/index.ts` — system prompt reescrito com detecção de intenção como Passo 1 obrigatório: 6 modos (pergunta direta, nutrição, treino, composição corporal, emocional, diagnóstico completo); formato estruturado de 6 seções agora só acionado no Modo F; resolve o problema de o coach sempre retornar diagnóstico completo independente da pergunta
- [improve] `src/components/AiChatModal.tsx` — chips de ação rápida atualizados com emojis de contexto: 🍽 nutrição / 💪 treino / ⚖️ peso / 🔍 análise completa

### Notas
- Mudança só na Edge Function (sem alteração de schema ou frontend relevante)
- Fase 7A-3 documentada em `memory/AI_Roadmap.md` como concluída
- Próxima: Fase 7B — log por linguagem natural

---

## [0.34.0] — 2026-03-18

### Adicionado
- [feat] `supabase/functions/ai-chat/index.ts` — Edge Function Kcal Coach: valida JWT, busca dados reais do usuário (diary + workouts + body + checkins + settings, 30 dias), monta system prompt com protocolos RP/Lucas Campos, chama gpt-4o-mini e retorna `{ reply }` em português
- [feat] `src/hooks/useAiChat.ts` — estado da conversa (`messages[]`), chamada à Edge Function via `supabase.functions.invoke`, loading state e tratamento de erro
- [feat] `src/components/AiChatModal.tsx` — bottom sheet completo: balões usuário/coach, chips de ação rápida ("Como estão meus macros?", "Como está meu volume?", "O que ajustar?"), loading animado (3 dots), textarea auto-expandível, envio por Enter
- [feat] FAB 🤖 roxo em todas as abas — posicionado acima da Nav, abre o AiChatModal

### Notas
- Fase 7A concluída (7A-1 backend + 7A-2 frontend)
- `OPENAI_API_KEY` configurada nos secrets do Supabase (Vault) — nunca entra no bundle
- Conversa em memória: zerada ao fechar o modal (intencional no MVP)
- Próximas fases: 7B (log por linguagem natural) e 7C (foto para macros)

---

## [0.33.0] — 2026-03-17

### Corrigido
- [fix] XSS em `TemplateHistoryModal.tsx` — `dangerouslySetInnerHTML` substituído por texto puro; `useMuscleVolume.ts` converteu 7 campos `detalhe` de HTML para string simples

### Documentação
- [docs] `memory/AI_Roadmap.md` — roadmap técnico completo da Fase 7 IA (arquitetura, decisões, segurança, specs por sessão)
- [docs] `memory/spec-fase-7A-1-ai-chat.md` — spec detalhada da sessão 7A-1

---

## [0.32.0] — 2026-03-16

### Adicionado
- [feat] `supabase/email-templates/invite-user.html` — template HTML com branding Kcalix para email de convite: logo, passos numerados, botão CTA roxo, instruções em português
- [feat] `supabase/email-templates/reset-password.html` — template HTML para reset de senha: mesmo padrão visual, info box para usuários convidados
- [feat] `supabase/email-templates/README.md` — instruções de aplicação no Supabase Dashboard

### Documentação
- [docs] Auditoria de segurança completa adicionada ao ROADMAP — 6 fragilidades mapeadas com severidade, impacto e status
- [docs] Checklist de segurança pré-deploy e periódico (trimestral) adicionado ao ROADMAP
- [docs] Seção de camadas de segurança implementadas atualizada no ROADMAP

### Notas
- Templates aplicados manualmente no Supabase Dashboard → Authentication → Email Templates
- Logo usa `https://kcalix.vercel.app/icon-192.png` — atualizar se domínio mudar
- Fragilidade XSS em `TemplateHistoryModal.tsx` é a próxima correção crítica
- Futuro: SMTP customizado via Resend quando houver domínio próprio (`@kcalix.app`)

---

## [0.31.0] — 2026-03-16

### Melhorado
- [improve] `AdminPage.tsx` — redesign completo: KPIs (Total/Ativos/Convidados/Pendentes), UserCards com avatar inicial + badge de status colorido, footer de ações, confirmação de remoção em dois passos, loading skeleton
- [improve] `LoginPage.tsx` — redesign com polish profissional: logo real (icon-192.png), card com gradiente escuro, inputs com foco roxo + glow, banner informativo no modo "Esqueci minha senha" explicando fluxo de convite
- [improve] `SetPasswordPage.tsx` — mesmo padrão visual da LoginPage; detecta `type=invite` na URL e exibe mensagens contextuais ("Ativar acesso" vs "Nova senha")
- [improve] `src/index.css` — `@keyframes spin` adicionado ao CSS global

### Corrigido
- [fix] RLS policy `admin_only` em `authorized_emails` — substituída `SELECT FROM auth.users` (sem permissão para role `authenticated`) por `auth.jwt() ->> 'email'`; fix em `supabase/migrations/003_admin_policy.sql`
- [fix] Edge Function `invite-user` — redeploy com `--no-verify-jwt`; JWT agora passado explicitamente no header da chamada (`src/lib/auth.ts`)
- [fix] `accepted_at` não era preenchido ao aceitar convite — trigger `on_user_confirmed` criado em `supabase/migrations/013_accepted_at_trigger.sql`

### Notas
- Migration 013 deve ser executada no SQL Editor do Supabase para novos projetos
- Edge Function `invite-user` requer `ADMIN_EMAIL` nas env vars do Supabase (já configurado)
- Pendências ITEM 10: toggle Free/Assinante (`profiles.plano`)
- ITEM 11 (diagnóstico de lentidão) ainda não iniciado

---

## [0.30.0] — 2026-03-16

### Adicionado
- [feat] `AdminPage.tsx` — convite direto via Edge Function `invite-user`; botões Desativar/Reativar usuário
- [feat] `MaisPage.tsx` — atalho "⚙️ Painel admin" visível só para o admin (`isAdmin`)
- [feat] `src/lib/auth.ts` — funções `inviteUser()`, `setUserAtivo()`, `checkUserAtivo()`
- [feat] `supabase/migrations/012_admin_features.sql` — coluna `ativo BOOLEAN DEFAULT true` em `authorized_emails`

### Notas
- `VITE_ADMIN_EMAIL` adicionado nas env vars do Vercel em 2026-03-16 para o menu admin aparecer em produção

---

## [0.29.0] — 2026-03-16

### Adicionado
- [feat] `src/hooks/useCustomFoods.ts` — CRUD Supabase para `custom_foods`; alimentos personalizados agora persistem entre sessões
- [feat] `src/components/Skeleton.tsx` — componente de loading skeleton com `animate-pulse`

### Melhorado
- [improve] `useSettings.ts` — `sanitizeSettings()`: valida shape JSONB, aplica fallbacks numéricos, corrige `goal` inválido para `'maintain'`
- [improve] `useWorkout.ts` — `sanitizeExercicio()`: descarta exercícios com `exercicioId` ausente/inválido ao carregar do Supabase
- [improve] `useDiary.ts` — `safeMeals`: garante que cada refeição é array antes de `.map()`/`.filter()`
- [improve] `HomePage.tsx` — spinner de tela inteira removido; `ProgressCard` e `EnergyCard` recebem `loading` e renderizam skeletons internamente
- [improve] `DiarioPage.tsx` — spinner de tela inteira removido; skeletons no KPI grid e lista de refeições durante carregamento
- [improve] `CorpoPage.tsx` — skeletons sobre o formulário durante loading
- [improve] `CustomFoodModal.tsx` + `FoodDrawer.tsx` — integrados com `useCustomFoods`; `onSave` agora async com feedback "Salvando..."

### Corrigido
- [fix] Alimentos personalizados sumiam ao fechar o drawer ou recarregar a página — `customFoods` era estado local, agora persiste no Supabase via `useCustomFoods`

### Notas
- ITEM 7 (defensividade dos hooks) concluído — nenhum hook retorna mais `NaN` ou `undefined` em campos numéricos
- ITEM 8 (loading states) concluído — nenhuma página exibe spinner de tela inteira
- Fix custom foods não estava no roadmap mas foi diagnosticado e corrigido nesta sessão
- Fase 6B ainda pendente: ITEM 10 (AdminPage convite direto) e ITEM 11 (diagnóstico lentidão)

---

## [0.28.2] — 2026-03-16

### Adicionado
- [feat] `.github/workflows/ci.yml` — GitHub Actions: `npm ci` → `npm run build` → `npm run test` em todo push/PR para main. Bloqueia merge com erro de TS ou teste quebrado.

---

## [0.28.1] — 2026-03-16

### Adicionado
- [feat] OG Tags em `index.html`: `description`, `og:title`, `og:description`, `og:image`, `og:url`, `og:type` — link compartilhado no WhatsApp/iMessage agora exibe preview

---

## [0.28.0] — 2026-03-16

### Adicionado
- [feat] Setup Vitest: `vitest` + `@vitest/coverage-v8` instalados; scripts `npm run test` e `npm run test:coverage` adicionados ao `package.json`
- [feat] `src/lib/__tests__/calculators.test.ts` — 12 testes cobrindo `bmrMifflin`, `bmrKatch`, `bodyDensityJP7`, `bfSiri` e `calcFromProfile` (100% funções, 90.7% statements)
- [feat] `src/lib/__tests__/migrationTransform.test.ts` — 26 testes cobrindo `validateExport`, `buildPreview`, `transformDiary`, `transformCustomExercises`, `transformCheckins` e `transformAll` (100% funções, 96.7% statements)

### Notas
- 38 testes, 0 falhas. `npm run test` passa em ~440ms.
- `environment: 'node'` (não jsdom) — funções puras sem DOM.
- `vite.config.ts` migrado de `defineConfig from 'vite'` para `defineConfig from 'vitest/config'` — build de produção não é afetado.
- Achado: goal `'cutting'` inexistente detectado nos fixtures — correto é `'cut'`. Código de produção nunca usou o valor errado.
- 5C (testes de hooks com mock Supabase) adiado — custo/benefício baixo no MVP.

---

## [0.26.0] — 2026-03-15

### Adicionado
- [feat] Onboarding automático: `CalcWizardModal` abre na primeira visita quando `user_settings` está vazio (`settings === null`). Usuários que já migraram dados não são afetados.
- [feat] Tela final "Tudo pronto!" no wizard (step `done`): cards com Objetivo, BMR/TDEE/Meta diária e Macros (P/C/G). Botão "Começar a usar o Kcalix →" confirma e salva.
- [feat] Proteção de dismiss: fechar o wizard sem salvar grava `kcalix_onboarding_dismissed` no localStorage por 7 dias — wizard não reaparece em recarregamentos acidentais.

### Corrigido
- [fix] `pendingResult` agora é resetado ao reabrir o wizard (`setPendingResult(null)` no useEffect de reset), evitando dados stale no step `done`.

### Notas
- Sessão 6B iniciada (Fase 6 — Qualidade e Robustez). Item 1 (Onboarding) concluído.
- Próximos itens da 6B: Error Boundary global, Vitest (testes calculators + migrationTransform), CI/CD.
- Diagnóstico técnico completo documentado em `memory/ROADMAP.md` seção FASE 6B.

---

## [0.25.0] — 2026-03-15

### Adicionado
- [feat] `public/manifest.webmanifest` — manifest PWA: nome, cores (#0a0e18 / #7c5cff), ícones 192/512, display standalone
- [feat] `src/components/InstallPrompt.tsx` — banner de instalação: Android (beforeinstallprompt nativo) + iOS (instrução compartilhar); dismiss por 7 dias via localStorage
- [feat] `vercel.json` — rewrite SPA (`/*` → `/index.html`); corrige erro 404 ao dar refresh em qualquer rota (/home, /treino, /corpo, etc.)
- [feat] Service worker automático via Workbox (vite-plugin-pwa GenerateSW) — precache do shell, app funciona offline

### Melhorado
- [improve] `index.html` — meta tags PWA completas: `apple-mobile-web-app-capable`, `apple-touch-icon` (icon-180px.png), `theme-color`, `lang="pt-BR"`
- [improve] `vite.config.ts` — vite-plugin-pwa configurado com navigateFallback e denylist para /kcx-studio

### Corrigido
- [fix] `src/lib/migrationTransform.ts` — import `CheckinRow` não utilizado removido (erro TS6133)

### Notas
- Fase 6 iniciada — PWA base implementado; polish restante (splash screen customizada, notificações push, atualização de SW com toast) ficam para próxima sessão
- ícones adicionados: icon-192.png, icon-512.png, icon-180px.png, favicon.svg (pasta public/)

---

## [0.22.0] — 2026-03-14

### Adicionado
- [feat] `supabase/migrations/012_custom_foods.sql` — tabela `custom_foods` com RLS e UNIQUE constraint nomeada `custom_foods_user_id_nome_unique`
- [feat] `src/lib/migrationTransform.ts` — interface `CustomFoodRow`, função `transformCustomFoods()`, campo `customFoods` no `TransformResult` e `transformAll()`
- [feat] `src/lib/migrationImport.ts` — step 8 upsert em `custom_foods` (batch 50, ignoreDuplicates), `customFoods` adicionado ao tipo `ImportProgress`

### Melhorado
- [improve] `src/components/MigrateModal.tsx` — alimentos personalizados entram no array de preview normalmente (removido "(em breve)"), label `Alimentos personalizados...` adicionado ao `STEP_LABELS`

### Notas
- Migration 012 deve ser executada no Supabase Dashboard antes de usar o import
- Sessão 5C concluída — próxima etapa: testes extensos de compatibilidade do import (dados reais, edge cases)

---

## [0.21.0] — 2026-03-09

### Adicionado
- [feat] `memory/supabase-utils.md` — SQL de referência para limpar dados do usuário no Supabase

### Melhorado
- [improve] `src/components/CalcWizardModal.tsx` — step `summary` fiel ao original: card com formato `♂/♀ · idade · peso · altura`, pergunta "Tem algo que queira atualizar?", botões "Revisar tudo →" e "Recalcular assim ✅" (recalcula BMR/TDEE/metas sem passar pelos 4 passos)
- [improve] `src/hooks/useSettings.ts` — adicionado `updatedAt?: string` ao tipo + `saveSettings` injeta timestamp automaticamente
- [improve] `src/components/ProfileCheckinModal.tsx` — campo "Perfil atualizado" lê `settings.updatedAt` diretamente (sem cast `unknown`)
- [improve] `src/pages/HomePage.tsx` — `onSave` do wizard chama `setProfileOpen(true)` após fechar: perfil reabre automaticamente; saldo no EnergyCard arredondado com `Math.round`
- [improve] `src/lib/migrationTransform.ts` — `transformCustomExercises` preserva `idOriginal` de cada exercício
- [improve] `src/lib/migrationImport.ts` — custom exercises inseridos antes dos workouts; constrói mapa `idOriginal → UUID Supabase`; workouts têm `exercicioId` reescrito antes de inserir (corrige nomes como `custom_177xxxx`)

### Corrigido
- [fix] `src/pages/TreinoPage.tsx` — `totalSeries` conta apenas séries com `reps > 0` (fiel ao original L6688)
- [fix] `src/hooks/useMuscleVolume.ts` — `resolvePrimaryGroup` tem fallback para grupos sem emoji (exercícios importados com `stripEmojiPrefix`)

---

## [0.20.0] — 2026-03-09

### Adicionado
- [feat] `supabase/migrations/011_checkins.sql` — tabela `checkins` com RLS e UNIQUE constraint nomeada (user_id, date)
- [feat] `src/hooks/useCheckins.ts` — CRUD Supabase, `buildCheckinPeriod` (resumo 7 dias: treino + nutrição), `calcProfileMetrics` (BF%/massa magra JP7), labels WZ_GOAL_LABELS / WZ_ACTIVITY_LABELS
- [feat] `src/components/ProfileCheckinModal.tsx` — modal com 3 views: perfil nutricional (Corpo/Energia/Macros/Perfil), form de check-in (peso/cintura/BF%/nota), histórico em cards; fiel ao original L4751–5063
- [feat] `src/index.css` — bloco CSS completo ProfileCheckinModal portado do original L1955–2026 (checkin-section, checkin-row, checkin-delta, checkin-last, checkin-hcard, checkin-form)
- [feat] `src/pages/HomePage.tsx` — botão "Meu Perfil Nutricional" abre ProfileCheckinModal em vez de navegar para /mais; CalcWizardModal integrado para botão "Atualizar →"
- [feat] `memory/ROADMAP.md` — Fase 5 marcada CONCLUÍDA, Fase 3 corrigida, Sessão 5B adiada

### Corrigido
- [fix] Botão "Atualizar →" no perfil: fecha o modal de perfil antes de abrir o wizard (fiel ao original L8843: `closeProfileCheckin(); openCalcWizard()`) — anterior abria wizard por trás do perfil

### Notas
- SQL `011_checkins.sql` deve ser executado no Supabase antes de usar check-in
- Pendência: botão "Atualizar →" abre wizard mas ao salvar não volta para o modal de perfil (próxima sessão)
- Pendência: checkins do app antigo não são importados pelo migrationTransform ainda (Sessão 5C)
- Pendência: `updatedAt` não é salvo no UserSettingsData — campo "Perfil atualizado" exibe "—"

---

## [0.19.0] — 2026-03-09

### Adicionado
- [feat] `src/lib/migrationTransform.ts` — tipos do JSON exportado, `validateExport`, `buildPreview`, `transformAll` e funções puras por entidade; correções: `stripEmojiPrefix` ("🦅 Costas" → "Costas"), `kcalPerMin` ausente via lookup em CARDIO_TYPES, `bmr/tdee=0` recalculados via `calcFromProfile`, campos ausentes em habits → `false`
- [feat] `src/lib/migrationImport.ts` — `runImport` com batches de 50, `ignoreDuplicates: true` em todos os upserts, progress callback por etapa
- [feat] `src/components/MigrateModal.tsx` — bottom sheet 4 etapas: instruções → preview → progresso animado → resultado; file picker via `<label>` nativo (iOS/Android); z-index 318/319
- [feat] `src/pages/MaisPage.tsx` — Card 3 "🔄 Migrar dados"
- [feat] `src/index.css` — bloco `/* MIGRATE MODAL */` com 11 classes
- [feat] `supabase/migrations/010_fix_workout_templates_unique.sql` — UNIQUE constraint nomeada em `workout_templates.user_id` (fix 42P10)

### Corrigido
- [fix] File picker não abria no mobile — substituído `button + .click()` por `<label>` com `<input>` embutido
- [fix] Sheet invisível — `.modal-sheet` não existia no CSS; convertido para `style` inline

### Notas
- Fase 5 em andamento. Importação funcional e validada com JSON real
- Divergências de kcal em dias pré-existentes são esperadas (`ignoreDuplicates: true`) — spec de diagnóstico pendente (Sessão 5B)
- Migration 010 deve ser executada no Supabase antes de re-importar com templates

---

## [0.18.0] — 2026-03-09

### Adicionado
- [feat] `src/components/WeeklyKcalModal.tsx` — modal bottom sheet histórico semanal de kcal; navegação ‹ › por semana; gráfico de barras (cinza = basal+treino, roxo = ingerido); linha tracejada da meta; projeção kg/sem 📉/📈; legenda; spinner lazy; z-index 312/313; fiel ao original L4342–4436
- [feat] `src/hooks/useWorkout.ts` — `fetchAllWorkoutRows(userId)` exportada como função standalone, sem instanciar hook completo

### Melhorado
- [improve] `src/pages/HomePage.tsx` — botão "📊 histórico" ativado (era disabled); carregamento lazy de kcal treino ao abrir modal (não no mount); wiring completo do WeeklyKcalModal

### Notas
- Fase 4 concluída (4A–4E). Próxima: Fase 5 — Ferramenta de Migração

---

## [0.17.0] — 2026-03-09

### Adicionado
- [feat] `src/components/HabitHistoryModal.tsx` — modal bottom sheet com 2 abas: calendário mensal (grid 7 colunas, score hm-0→hm-5 gradiente roxo, tooltip ao clicar dia) + por hábito (8 barras semanais, aderência 4 semanas, streak 🔥); z-index 324/325 fiel ao original L8236–8412
- [feat] `src/hooks/useHabits.ts` — `getAllHabits()` query lazy de 365 dias; chamada só ao abrir o modal
- [feat] `src/components/HabitTracker.tsx` — botão 📊 no trigger abre `HabitHistoryModal`; prop `onOpenHistory` adicionada
- [feat] `src/index.css` — CSS completo do modal: `.habit-hist-*`, `.habit-hm-*`, `.habit-tr-*` portado do original L2029–2065

### Melhorado
- [improve] Calendário: dias anteriores ao primeiro registro tratados como `isBefore` (opacidade 0.2, não clicáveis) — evita falsa impressão de "score zero" em datas sem dado real
- [improve] Aba "Por hábito": barras de semanas sem dado com `opacity: 0.2`; legendas `dd/mm` por semana em font-size 8px abaixo das barras

### Notas
- Próxima sessão (4E): `WeeklyKcalModal` — clicar no card "📅 Últimos 7 dias" da HomePage abre histórico de gasto calórico diário (ingerido + treino + saldo) com navegação semanal

---

## [0.16.0] — 2026-03-09

### Adicionado
- [feat] `supabase/migrations/009_habits.sql` + `009b_fix_habits_schema.sql` — tabela `habits` com 5 colunas booleanas (dieta, log, treino, cardio, medidas), `custom_habits JSONB` para futuros hábitos customizáveis, RLS e CONSTRAINT nomeada
- [feat] `src/types/habit.ts` — tipos `HabitKey`, `HabitDef`, `HabitRow`, `HabitsMap`; constantes `HABITS_DEF` (5 hábitos fixos com cores e ícones) e `HABIT_DAY_LBLS`
- [feat] `src/hooks/useHabits.ts` — hook com `toggleHabit` (optimistic UI), `autoCheckHabit`, `getWeekDates`; carrega 30 dias de histórico; padrão idêntico ao `useDiary`
- [feat] `src/components/HabitTracker.tsx` — accordion fiel ao original L8138–8222: trigger com score dots coloridos + chevron animado, grid 7×5 (dias × hábitos), dots 26px com glow `--h-color`, `.future-dot` desabilitado, `.today-dot` borda mais brilhante, score bar no rodapé
- [feat] `src/index.css` — bloco CSS completo do HabitTracker portado do original L1731–1815 (`.habit-card`, `.habit-trigger`, `.habit-dot`, `.habit-score`, etc.)
- [feat] `src/pages/HomePage.tsx` — `HabitTrackerPlaceholder` substituído pelo componente real; botão "Meu Perfil Nutricional" agora navega para `/mais`
- [feat] `src/pages/TreinoPage.tsx` — `autoCheckHabit('treino')` e `autoCheckHabit('cardio')` ao salvar treino (fiel ao original L6710–6711)

### Corrigido
- [fix] `HabitTracker` — `ScoreDots` usa classe `.lit` + CSS custom property `--h-color` em vez de `style` inline que sobrescrevia o CSS
- [fix] Schema da tabela `habits` criada com coluna `data JSONB` genérica pelo Supabase — corrigido com `009b_fix_habits_schema.sql` (DROP + CREATE)

### Notas
- Arquitetura preparada para hábitos customizáveis futuros: `custom_habits JSONB` na tabela + `HabitDef` aceita `id: HabitKey | string`
- Sessão 4D planejada: histórico mensal de hábitos (`HabitHistoryModal`) + UI para criar/editar/excluir hábitos personalizados
- Bug recorrente do Supabase registrado na memória: tabelas criadas com `data JSONB` genérico — padrão de fix: `NNNb_fix_xxx_schema.sql`

---

## [0.15.0] — 2026-03-09

### Adicionado
- [feat] `src/hooks/useSettings.ts` — campos opcionais `pKg`, `cKg`, `minFatKg`, `def`, `blocks`, `kcalPerBlock` adicionados para suportar wizard JP7 e cálculo de macros
- [feat] `src/components/CalcWizardModal.tsx` — wizard fullscreen 5 etapas: Objetivo → Perfil → Medidas → Dobras JP7 → Resultado; preview BMR em tempo real; fiel ao original L2313–2524
- [feat] `src/pages/MaisPage.tsx` — port completo do `viewMais`: NutriBanner com BMR/TDEE/macros e status de completude; card "Calculadora JP7" com wizard integrado; card "Configurações"; fiel ao original L2313–2524
- [feat] `src/index.css` — port de ~320 linhas de CSS estrutural do original: `.btn`, `.card`, `.accordion`, `.kpi`, `.form-group`, `.wizard-*`, `.checkin-*`

### Corrigido
- [fix] `src/hooks/useDiary.ts` — fix defensivo em `totals` ausentes em dados antigos que causava crash na `HomePage`

### Impacto desbloqueado
- `HomePage` `EnergyCard`: exibe BMR/TDEE/saldo real após configurar perfil no wizard
- `DiarioPage` KPIs: barras P/C/G com meta real
- `CorpoPage`: BF% JP7 visível no histórico

---

## [0.14.0] — 2026-03-09

### Adicionado
- [feat] `supabase/migrations/008_body_measurements.sql` — tabela `body_measurements` com RLS e CONSTRAINT nomeada (sem trigger updated_at)
- [feat] `src/types/body.ts` — tipos `BodyMeasurement`, `Skinfolds`, `BodyRow`
- [feat] `src/hooks/useBody.ts` — CRUD otimista por data + `getAllBodyRows()`; padrão idêntico ao `useDiary`
- [feat] `src/pages/CorpoPage.tsx` — port fiel ao original L2526–2602: 3 accordions (Inputs / Dobras JP7 / Histórico 14 dias), tabela clicável, toast de feedback

### Corrigido
- [fix] Erro `42P10` — UNIQUE sem nome no upsert; corrigido com `CONSTRAINT body_measurements_user_date_unique`
- [fix] Erro `42703` — trigger `updated_at` referenciando coluna inexistente; trigger removido

### Notas
- Regras críticas gravadas na memória persistente: CONSTRAINT sempre nomeada + sem trigger `updated_at`
- "Ver evolução 📈" presente mas desabilitado — gráfico de evolução entra na Fase 6
- Skill `/end` restaurada para formato de lista com `-` (gera botões clicáveis no Claude Code)

---

## [0.13.0] — 2026-03-09

### Adicionado
- [feat] `src/hooks/useMuscleVolume.ts` — cálculos de volume muscular: calcMuscleVolume, calcMuscleAvg4weeks, calcFrequencyAlert, getAllExSessions, getAllTmplSessions, buildInsightsByGroup, 5 insights automáticos (plateau, volume cycling, rep monotony, imbalance, chronic low); fiel ao original L6943–7340
- [feat] `src/components/CoachGuideModal.tsx` — guia educativo: 5 abas (MEV/MAV/MRV, Volume Cycling, Rep Ranges, Deload, Progressão), tabela de landmarks por grupo, chips de detalhe; z-index 319/320
- [feat] `src/components/ExerciseProgressionModal.tsx` — progressão por exercício: PR badge, gráfico de barras (toggle carga/volume), tabela com delta entre sessões; z-index 302/303; fiel ao original L7357–7444
- [feat] `src/components/TemplateHistoryModal.tsx` — histórico de treinos: 3 abas (Por treino / Por exercício / Por grupo); KPIs, tabela de sessões, progressão por exercício (clicável → ExerciseProgressionModal), select agrupado, mg-cards com barra MEV/MRV e marcador roxo, chips de insight expansíveis; z-index 320/321; fiel ao original L7446–7731
- [feat] `src/hooks/useWorkout.ts` — getAllWorkoutRows() busca 200 sessões históricas do Supabase para analytics
- [feat] `supabase/migrations/006_fix_workouts_unique_constraint.sql` — fix constraint UNIQUE (user_id, date) perdida na recriação manual da tabela (erro 42P10)
- [feat] `supabase/migrations/007_fix_workouts_schema.sql` — fix completo: colunas created_at/updated_at + UNIQUE + trigger updated_at (erro 42703)

### Melhorado
- [improve] `src/pages/TreinoPage.tsx` — wiring dos 3 modais de analytics; botões 📊 (header→TemplateHistoryModal) e 📖 (CoachGuideModal) conectados; botão 📊 em cada exercício abre ExerciseProgressionModal; workoutRows recarrega ao abrir modais E após salvar
- [improve] `src/hooks/useWorkout.ts` — botão Salvar volta para estado "Salvar ▶" automaticamente ao editar após salvar (reset via useEffect em state)

### Notas
- Z-index stack completo: ExercProg (302/303) < CoachGuide (319/320) < TmplHist (320/321) < TmplEditor (320/321) < ExerciseSelector (328/329) < CustomExModal (330/331)
- Migrations 006 e 007 devem ser executadas no Supabase SQL Editor (schema foi recriado manualmente em sessão anterior sem colunas/constraints completas)
- Pendências registradas no ROADMAP: click linha sessão → navegar data; long-press preset timer; notif push; arquivar custom exercise

---

## [0.12.0] — 2026-03-08

### Adicionado
- [feat] `src/components/TemplateEditorModal.tsx` — editor de templates completo: nome, 8 cores, lista de exercícios (reordenar + remover), catálogo por grupo muscular + "⭐ Meus exercícios", cardio padrão (tipo + minutos), delete two-tap com auto-reset 3s; fiel ao original L7761–8066
- [feat] `src/hooks/useWorkout.ts` — `swapExercise(index, newId)` troca exercicioId in-place mantendo séries (corrige TODO da Sessão 3B); `applyTemplate(tmpl)` carrega exercícios + cardio do template no estado do dia
- [feat] `src/pages/TreinoPage.tsx` — botão ✏️ em cada chip de template abre TemplateEditorModal; botão "+ Nova rotina" cria template vazio; confirm() antes de applyTemplate quando há séries preenchidas (fiel ao original L6260–6263)

### Melhorado
- [improve] `src/pages/TreinoPage.tsx` — handleExSelect usa swapExercise in-place (antes: remove+add movia exercício para o final da lista)

### Notas
- TMPL_COLORS: `['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa','#fb923c','#f472b6','#22d3ee']` — fiel ao original L7748
- Z-index stack: TemplateEditorModal (320/321) < ExerciseSelector (328/329) < CustomExerciseModal (330/331)

---

## [0.11.0] — 2026-03-08

### Adicionado
- [feat] `src/pages/TreinoPage.tsx` — Cardio funcional: select CARDIO_TYPES + input minutos + botão remover + kcalPerMin automático ao trocar tipo; fiel ao original L6654–6680
- [feat] `src/pages/TreinoPage.tsx` — Timer de Pausa completo: tabs Timer/Cronômetro, display 56px tabular-nums com cores dinâmicas (branco→roxo→lilás), 5 presets fixos (0:30/1:00/1:30/2:00/3:00), Stop/Reset, Cronômetro Iniciar/Pausar/Reset; fiel ao original L2646–2675 + L1876–1889 + L6715–6879
- [feat] `src/pages/TreinoPage.tsx` — Nota do treino conectada: input controlado via `setNota()`, persiste no Supabase junto com o `saveWorkout()`

### Notas
- Sessão 3C concluída — Cardio + Timer + Nota + Salvar funcional de ponta a ponta
- Toast pós-salvar não implementado (botão muda para "✓ Salvo" — equivalente visual); toast planejado para polish geral
- Notificação de timer finalizado depende de service worker (PWA — Fase 6)
- Presets editáveis por long-press (original) → planejado para Fase 6

---

## [0.9.0] — 2026-03-08

### Adicionado
- [feat] `src/components/ExerciseSelector.tsx` — bottom sheet: abas por grupo muscular, grid de exercícios, modos "add" e "swap"; fiel ao original L2837–2850 + L6440–6591
- [feat] `src/pages/TreinoPage.tsx` — lista de exercícios funcional: accordion por exercício, set-table com inputs reps/carga (16px, tabular-nums, :focus roxo), prev-ref ▲▼= assíncrono (lazy ao abrir accordion), badge dinâmico (carga/preenchidas), volume, botões 📊/🔄/✕; fiel ao original L6323–6438
- [feat] `src/index.css` — classe `.set-input` com `:focus { border-color: rgba(124,92,255,.4) }` e `font-variant-numeric: tabular-nums` (fiel ao original L1426–1432)
- [feat] `.claude/commands/check-port.md` — nova skill `/check-port` para validar fidelidade do port ao original linha a linha

### Corrigido
- [fix] `useWorkout.ts` — `addExercise` agora inicia com 3 séries vazias (fiel ao original L6531; era 1)
- [fix] `TreinoPage.tsx` — `chartBtnStyle` corrigido para circular 28×28 + `color: var(--text3)` (fiel ao original L1533–1540)
- [fix] `TreinoPage.tsx` — `getSecondary()` recebia grupo em vez de exercicioId — grupos secundários não apareciam

### Notas
- Sessão 3B concluída — ExerciseSelector + Exercícios + Séries
- Swap usa remove+add (exercício vai para o fim) — `swapExercise` in-place planejado para Sessão 3D
- Exercícios personalizados (aba "⭐ Meus") adicionados ao ROADMAP como Sessão 3B+ antes da 3C
- Skill `/check-port` incorporada ao fluxo: `/port → implementa → /check-port → /review → /end`

---

## [0.8.0] — 2026-03-08

### Adicionado
- [feat] `src/data/exerciseDb.ts` — EXERCISE_DB (9 grupos, 70+ exercícios), EX_SECONDARY, MUSCLE_LANDMARKS, MUSCLE_ORDER, CARDIO_TYPES, DEFAULT_TEMPLATES + tipos TypeScript + helper `exById()`
- [feat] `supabase/migrations/004_workout_tables.sql` — tabelas `workouts` + `workout_templates` com RLS (4 policies cada), índices e trigger `updated_at` com `search_path` fixo (EXECUTADO no Supabase)
- [feat] `src/types/workout.ts` — WorkoutSet, WorkoutExercise, CardioEntry, WorkoutDayData, WorkoutRow, WorkoutTemplate, WorkoutState
- [feat] `src/hooks/useWorkout.ts` — carrega/salva treino por data, gerencia templates (Opção A: array JSONB), `kcalPerSet()`, sincroniza `kcalTreino` no `diary_entries` ao salvar, `getLastWorkoutForExercise()` para prev-ref (Sessão 3B)
- [feat] `src/pages/TreinoPage.tsx` — estrutura base fiel ao original: card-header (📊/📖/Salvar), tmpl-section colapsável com grid de rotinas, ex-list, accordions Cardio+Timer, campo de nota, workout-summary (4 KPIs)

### Notas
- Sessão 3A concluída — Fase 3 em andamento
- SQL executado no Supabase; função `update_updated_at_column` com `SECURITY DEFINER + SET search_path = ''` (elimina warning de segurança)
- Funcionalidade de adicionar exercícios/cardio e botão Salvar: Sessões 3B e 3C
- Deploy pendente para próxima sessão

---

## [0.7.0] — 2026-03-08

### Adicionado
- [feat] Navegação por data global — `dateStore` (Zustand): selectedDate, goToPrev, goToNext, goToToday, isToday
- [feat] `DateNavBar` — header global em todas as abas: nome da página (esq) + btn "hoje" + date-pill `‹ Dom, 08/03 ›` (dir)
- [feat] Banner roxo "📅 Editando: [data] → Hoje" aparece em todas as abas ao navegar para dia diferente de hoje
- [feat] Zustand instalado como dependência

### Melhorado
- [improve] `useDiary(date?)` — aceita `date` como parâmetro (default = hoje); recarrega dados do Supabase ao mudar data
- [improve] `DiarioPage` e `HomePage` — usam `selectedDate` do dateStore; dados carregados dinamicamente por data
- [improve] `DiarioPage` — header redundante "Diário" removido do card de totais (título já no DateNavBar)

### Notas técnicas
- DateNavBar integrado no `AppLayout` (fora do `<main>`) — persiste ao trocar de aba sem re-render
- btn "hoje" invisível quando é hoje (opacity: 0, pointerEvents: none) — idêntico ao `.btn-hoje.visible` do original
- `›` desabilitado visualmente quando selectedDate === hoje (não avança além de hoje)
- Fiel ao original: CSS `.date-pill` (L111), `.date-nav-btn` (L1637), `.btn-hoje` (L2072), `updateDayBanner` (L8088)

### Sessão 2E concluída — Fase 2 CONCLUÍDA
- Pré-requisito para Fase 3 (TreinoPage) cumprido

---

## [0.6.0] — 2026-03-08

### Adicionado
- [feat] HomePage — saudação dinâmica por hora: "Bom dia 👋" / "Boa tarde 👋" / "Boa noite 🌙" (fiel ao original linha 4446)
- [feat] HomePage — Card "⚡ Energia Hoje" separado com KPI row de 4 colunas: kcal in / basal / treino / saldo; sem BMR exibe mensagem de configuração; `energy-meta-line` vertical no fim da barra
- [feat] HomePage — HabitTracker placeholder no topo com estilo `.habit-card` fiel ao original (rgba(0,0,0,.35), border rgba(124,92,255,.22)); 5 hábitos (dieta/log/treino/cardio/medidas) desabilitados até Fase 4
- [feat] HomePage — Grid de ações 2×2: Diário / Treino / Corpo / Mais; botão full-width "Meu Perfil Nutricional" placeholder (disabled, Fase 4)

### Melhorado
- [improve] HomePage — Card de progresso clicável → navega para /diario (fiel ao original `onclick="openTab('diario')"`)
- [improve] HomePage — macros: labels uppercase com `letter-spacing:.06em`, barra 4px (era 6px), cores `--pColor/--cColor/--gColor` (era `--good/--warn/--bad`)
- [improve] HomePage — título do gráfico "📅 Últimos 7 dias" + botão "📊 histórico" (placeholder disabled — modal na Fase futura)
- [improve] HomePage — data formatada com primeira letra maiúscula (fiel ao `charAt(0).toUpperCase()` do original)
- [improve] HomePage — padding-bottom com safe-area-inset-bottom para não sobrepor Nav

### Notas técnicas
- Port completo da viewHome (HTML linha 2114, CSS linha 1817, JS linha 4438 do referência.index.html)
- Botão "📊 histórico" e "Meu Perfil Nutricional" ficam disabled — modais implementados nas fases futuras
- EnergyCard exibe TDEE como nota de rodapé quando disponível (não estava no original, adição leve)

### Pendências registradas
- Modal "📊 histórico semanal" — implementar quando TreinoPage tiver dados de kcal de treino (Fase 3)
- "Meu Perfil Nutricional" (wizard JP7) — Fase 4
- HabitTracker real — Fase 4
- TEST: celular real (375px, toque, teclado virtual, safe-area) — válido para toda Fase 2
- TEST: persistência multi-dispositivo — válido para toda Fase 2

---

## [0.5.0] — 2026-03-08

### Adicionado
- [feat] CustomFoodModal — bottom sheet com form-grid cols-2: nome, porção, P/C/G/kcal; cálculo automático de kcal via (p×4)+(c×4)+(g×9) com override manual e link "↺ recalcular"
- [feat] FoodDrawer — botão "➕ Criar alimento personalizado" (fd-custom-btn fiel ao original: dashed border roxo, bg rgba(124,92,255,.06))
- [feat] FoodDrawer — aba "⭐ Meus" aparece dinamicamente quando há alimentos personalizados; após salvar, ativa automaticamente a aba
- [feat] useDiary.getWeekKcal() — busca kcal de múltiplas datas em 1 query Supabase (`.in('date', dates)`)
- [feat] WeeklyChart real na HomePage — 7 dias Seg→Dom com barras normalizadas, linha de meta dashed, hoje destacado com border accent2, dias sem dado com opacity .4, dias futuros sem barra, projeção kg/semana (≥2 dias)

### Melhorado
- [improve] FoodDrawer — drawer termina em `calc(56px + env(safe-area-inset-bottom))` acima da Nav, resolvendo sobreposição do botão pela barra de navegação
- [improve] FoodDrawer — zIndex 60/59 (overlay+drawer acima da Nav z-50)
- [improve] HomePage — removido guard EmptyState que bloqueava a página quando não havia settings; defaults para zero em todos os targets

### Corrigido
- [fix] FoodDrawer — alimentos personalizados não entravam em nenhuma categoria; corrigido com aba dedicada `__custom__` e inclusão em `allDbItems` (aba "Todos" e busca)

### Descartado
- fd-peek (lista "Adicionados hoje" colapsável): desnecessário — Kcalix já mostra alimentos dentro do accordion de cada refeição, solução superior ao original

### Notas técnicas
- WeeklyChart: hoje usa `diary.totals.kcal` do estado local (sem lag), demais dias do Supabase
- CustomFoodModal: estado efêmero em `customFoods[]` local no FoodDrawer — persistência real planejada para Fase 5 (migração)
- Projeção semanal: `kgPerWeek = (avgBalance × 7) / 7700`, só exibe com ≥2 dias com dado

### Pendências registradas
- DiarioPage: barras P/C/G no KpiCard não pintam sem meta configurada (target===0) — aguarda wizard Fase 4 ou fallback visual
- TEST: persistência multi-dispositivo (mesmo dado em dois navegadores)
- TEST: celular real (375px, toque, teclado virtual, safe-area)

---

## [0.4.0] — 2026-03-07

### Melhorado
- [improve] DiarioPage — visual fiel ao original: KPI grid com barra colorida no topo, linha kcal gradient text (roxo→verde), status pills com dot colorido e diff por macro, accordion de meals (1 aberto por vez), summary "P·C·G" no header colapsado, quick buttons +.5P/+1P/+.5C/+1C/+.5G/+1G
- [improve] FoodDrawer — visual fiel ao original: gradiente escuro (#1a2035→#121828), handle, busca com ícone 🔍 e botão ✕ de limpar, cat-tabs com gradiente roxo ativo, food-items como cards bordados
- [improve] FoodPortionModal — bottom sheet real (sobe da base), qty decimal (−.5/−.1/+.1/+.5), input direto, macro boxes 4 colunas coloridas, meal-select-row fiel ao original
- [improve] index.css — variáveis --pColor/--cColor/--gColor; ambient glow body::before/::after

### Corrigido
- [fix] Bug arquitetural: FoodPortionModal instanciava useDiary() próprio, não sincronizando com DiarioPage — corrigido passando addFoodOptimistic via props (DiarioPage → FoodDrawer → FoodPortionModal)
- [fix] Fluxo de adição idêntico ao original: botão único "🍽️ Adicionar alimentos" no card de totais, refeição selecionada dentro do modal
- [fix] Quantidade decimal no FoodPortionModal: min=0.1, step=0.1 (era inteiro com clamp mínimo 1)

### Adicionado
- [feat] addFoodOptimistic() em useDiary — atualiza estado React imediatamente, persiste Supabase em background sem bloquear UI
- [feat] Skill /port — metodologia de port destilada da sessão 2C, com mapa de linhas do original, regras de fidelidade CSS/React/TS e checklist

### Notas técnicas
- Estado único: useDiary() instanciado só no DiarioPage; callbacks descem via props
- Optimistic UI: setDiary(next) → upsert background sem await bloqueante
- Bottom sheets: background linear-gradient(180deg, #1a2035, #121828) fiel ao .modal-sheet original

### Pendências (Sessão 2D)
- Gráfico semanal real na HomePage — ler 7 dias do Supabase
- Testar no celular real (375px, toque, teclado virtual, safe-area)
- FoodDrawer: fd-peek (adicionados hoje) + botão "Criar alimento personalizado"

---

## [0.3.0] — 2026-03-07

### Adicionado
- [feat] foodDb.ts — FOOD_DB extraído do app original, 9 categorias, ~130 itens tipados
- [feat] DiarioPage — 6 seções de refeição (Café, Lanche 1, Almoço, Lanche 2, Jantar, Ceia), totais do dia, barras de macro
- [feat] FoodDrawer — bottom sheet 88dvh, busca global em tempo real, abas Recentes/Todos/categorias
- [feat] FoodPortionModal — ajuste de quantidade, preview ao vivo de macros, persistência no Supabase
- [feat] getRecentFoods() — últimos 10 alimentos únicos varrendo histórico de diary_entries

### Corrigido
- [fix] useDiary — corrigido de 4 para 6 refeições (cafe, lanche1, almoco, lanche2, jantar, ceia)
- [fix] Optimistic update em addFood/removeFood — UI atualiza imediatamente, reverte em caso de erro de rede
- [fix] FoodPortionModal — quantidade mínima 1, steps inteiros (removido clamp de 0.5 que impedia adicionar)

### Decisoes tecnicas
- MEALS do app original tem 6 refeições (não 4 como estava no useDiary inicial) — corrigido após leitura do referência.index.html
- Optimistic update: setDiary(next) antes do await upsert, rollback com setDiary(previous) se error

### Pendencias (Sessao 2C — polish)
- Layout geral da DiarioPage e FoodDrawer precisa de refinamento visual
- FoodPortionModal: aceitar input numérico direto além dos botões +-
- Gráfico semanal na HomePage: ler últimos 7 dias do Supabase (atualmente só mostra dia atual)
- Testar persistência multi-dispositivo
- Testar no celular real (375px, toque, teclado virtual, safe-area)

---

## [0.2.0] — 2026-03-07

### Adicionado
- [feat] Nav — barra de 5 abas (Home, Diário, Treino, Corpo, Mais) com safe-area-inset-bottom para iPhone X+
- [feat] AppLayout — layout com Outlet + Nav inferior, rotas /home /diario /treino /corpo /mais
- [feat] HomePage — cards de energia (kcal consumida/meta, barra de progresso), macros (P/C/G), balanço calórico, gráfico semanal, hábitos placeholder
- [feat] useSettings — hook que lê/salva user_settings (JSONB) no Supabase
- [feat] useDiary — hook que lê/salva diary_entries do dia (JSONB) no Supabase, com addFood/removeFood/setKcalTreino
- [feat] goalPresets.ts — GOAL_PRESETS, WZ_ACTIVITY_LABELS, GoalType (portado do app original linha 4608)
- [feat] calculators.ts — bmrMifflin, bmrKatch, bodyDensityJP7, bfSiri, calcFromProfile() (portado do app original linhas 5124-5208)

### Removido
- [remove] DashboardPage.tsx — substituído pela estrutura de abas (AppLayout + HomePage)

### Decisoes tecnicas
- calcAll() do app original não é portável (acoplada ao DOM) — substituída por calcFromProfile(profile) com parâmetros tipados
- Card de hábitos na HomePage = placeholder estático — hook real implementado na Sessão 4 junto com CorpoPage/HabitosPage
- Gráfico semanal exibe apenas o dia atual enquanto não há histórico acumulado — Sessão 2B completa isso

### Pendencias
- Sessão 2B: DiarioPage + FoodDrawer + FoodPortionModal + foodDb.ts
- Testar reset de senha por email (rate limit atingido em 2026-03-07)
- Testar no celular real (375px, toque, teclado virtual)

---

## [0.1.0] — 2026-03-07

### Adicionado
- [feat] Autenticacao completa com email/senha via Supabase
- [feat] LoginPage — formulario de login + recuperacao de senha
- [feat] SetPasswordPage — define senha via link de convite ou reset (detecta tokens via onAuthStateChange)
- [feat] DashboardPage — placeholder pos-login com logout e link para admin
- [feat] AdminPage em `/kcx-studio` — CRUD de emails autorizados + instrucao de convite manual
- [feat] Roteamento com guards PrivateRoute / AdminRoute / PublicRoute
- [feat] authStore — estado global de autenticacao reativo sem biblioteca externa
- [feat] Schema completo do banco: profiles, user_settings, diary_entries, workouts, workout_templates, body_measurements, habits, checkins, custom_exercises, authorized_emails
- [feat] RLS em todas as tabelas — cada usuario acessa apenas seus proprios dados
- [feat] Triggers: criacao automatica de perfil ao primeiro login, updated_at automatico
- [feat] Policy admin_only em authorized_emails — somente adilson.matioli@gmail.com tem acesso

### Decisoes tecnicas
- Google OAuth adiado — email/senha suficiente para MVP
- Resend adiado — sem dominio proprio ainda, usando email Supabase
- Convite manual via painel Supabase (Authentication > Users > Invite user) — evita expor service_role key no frontend
- Rota admin ofuscada: `/kcx-studio`
- Email admin via VITE_ADMIN_EMAIL no .env.local (nunca commitado)

### Banco de dados
- `supabase/migrations/001_initial_schema.sql` — schema completo + RLS + triggers
- `supabase/migrations/003_admin_policy.sql` — policy admin para authorized_emails

### Pendentes para proxima sessao (validacao)
- Testar fluxo de reset de senha por email (rate limit atingido em 2026-03-07)
- Testar no celular real (375px, toque, teclado virtual)
- Configurar Resend quando tiver dominio proprio

---

## [0.0.1] — 2026-03-07

### Adicionado
- [feat] Setup inicial — Vite + React + TypeScript + Tailwind + Supabase
- [feat] Estrutura de pastas: pages, components, lib, store, hooks, types
- [feat] Repositorio GitHub + Vercel configurados
- [feat] Skills Claude Code em .claude/commands/
- [docs] ROADMAP.md e MEMORY.md criados
