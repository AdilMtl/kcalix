# AGENTS.md — Kcalix Connector

Vale para tudo dentro de `connector/`. **Tem precedência sobre o `AGENTS.md` da raiz**,
que continua valendo para o resto.

O Connector é um APK Android privado (Kotlin nativo) que lê o Health Connect
(Samsung Health → Galaxy Watch 5) e sincroniza manualmente com o Kcalix. Não vai
para a Play Store e não é o app Kcalix.

## Comandos

```bash
cd connector/android
.\gradlew.bat :app:assembleDebug   # build do APK debug
.\gradlew.bat :app:installDebug    # instala no aparelho conectado
.\gradlew.bat :app:testDebugUnitTest
```

## Leia antes de agir

Nesta ordem, sempre:

1. `memory/kcalix-connector/README.md` — índice canônico
2. `memory/kcalix-connector/ROADMAP.md` — fases e gates G0–G5
3. `memory/kcalix-connector/ISSUES.md` — backlog e estado de cada Issue
4. `memory/kcalix-connector/specs/KCX-CONN-NNN.md` — a spec da Issue ativa

O estado real de cada Issue vive no `ISSUES.md`, não na sua memória da conversa.

## Como o trabalho é organizado

Uma **Issue** (`KCX-CONN-NNN`) é uma entrega vertical verificável. Estados válidos:
`BACKLOG`, `DRAFTING`, `READY`, `IN_PROGRESS`, `BLOCKED`, `VALIDATING`, `DONE`,
`CANCELLED`. Apenas **uma** Issue fica `IN_PROGRESS` por sessão.

```text
Issue READY → spec aprovada → implementação → testes → evidência registrada
```

Regras de sequência:

- **Código não começa** antes da Issue estar `READY` e a spec `APPROVED`.
- Respeite `Depende de`. Não pule para uma Issue porque ela parece mais fácil.
- Uma fase só termina quando a **evidência** está registrada — não quando compila.
- Descoberta que muda produto ou arquitetura vira decisão registrada, não fica
  escondida no código.
- Se nenhuma Issue estiver `READY`, a tarefa da sessão é completar a documentação
  que libera a próxima — não improvisar implementação.

## Branch

Branch da iniciativa: **`codex/kcalix-connector`**. Não implementar o Connector na `main`.

- Se a branch ativa não for essa, **pare** antes de alterar código.
- Commits citam a Issue: `KCX-CONN-007: read Health Connect records`.
- Um commit não mistura duas Issues nem carrega correções alheias ao Connector.
- Mudanças preexistentes e não relacionadas não devem ser staged, commitadas,
  descartadas ou movidas.
- Merge na `main` só depois do gate, revisão e autorização do usuário.

## Proibido nesta fase

O projeto ainda não passou pelo gate de dados reais (G2). Portanto:

- **Não** declarar ou solicitar permissões do Health Connect.
- **Não** ler, exportar, persistir ou enviar dados de saúde reais.
- **Não** adicionar permissão `INTERNET` ao manifesto.
- **Não** criar migration, Edge Function, login ou sincronização.
- **Não** commitar valor pessoal, screenshot sensível ou export de saúde — em
  nenhuma hipótese, nem como fixture de teste.
- **Não** copiar código de projeto de referência antes de confirmar licença,
  compatibilidade e aderência à spec.

Manter `allowBackup="false"`. Sem log de valores de saúde, tokens ou IDs.

## Regras de domínio já decididas

Estas saíram da descoberta de produto e não devem ser reinventadas:

- Kcalix é fonte de verdade para exercícios, séries, repetições, cargas e
  alimentação. O Watch **nunca** infere, substitui ou apaga isso.
- O Watch é fonte candidata para horário, duração, distância, FC e estimativa
  calórica da sessão.
- **Nunca somar** kcal do Watch com a estimativa do Kcalix para a mesma atividade.
- `TotalCaloriesBurnedRecord` inclui energia basal — não é "caloria ativa" e não
  pode alterar o saldo diário, porque o Kcalix já calcula BMR/TDEE.
- Mesma data **não** prova que duas sessões são a mesma. Match exige tipo,
  intervalo e duração.
- Musculação e cardio não são fundidos só porque ocorreram no mesmo dia.
- Todo vínculo ou importação começa como sugestão, exige confirmação e é reversível.
- Body fat por BIA do Watch, JP7 e manual são métodos distintos e não se misturam.

## Ao encerrar

Atualize estado, data e links de evidência na Issue. Relate: Issue e estado final,
gate avançado ou bloqueio, arquivos tocados, testes e evidências, itens **não**
testados, decisão tomada e o próximo ID a executar.
