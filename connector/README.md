# Kcalix Connector

Aplicativo Android privado que lê resumos do Health Connect no celular e os envia, com
autenticação e idempotência, para o Supabase do Kcalix.

## Estado

Planejamento aprovado em 2026-07-19. Ainda não há código Android, migration ou Edge Function
do conector. A implementação será feita na branch longa `feature/kcalix-connector` e somente
será integrada à `main` após os gates de segurança, aparelho real e piloto.

## Documentos executáveis

- [Spec técnica e de produto](docs/SPEC.md)
- [PRD do piloto privado](docs/PRD.md)
- [Stack e setup Android para iniciante](docs/ANDROID_SETUP.md)
- [Backlog de issues e sessões](docs/ISSUES.md)
- [Pacotes autocontidos das issues](issues/README.md)
- [Skills para iniciar, executar e encerrar sessões](docs/AGENT_SKILLS.md)

O handoff de exploração que originou esta frente foi consolidado na spec, no PRD e nos packets;
esses documentos versionados são a fonte de verdade para novas sessões.

## Estrutura prevista

```text
connector/
  README.md
  docs/                 # decisões, PRD, setup e backlog
  issues/               # packets autocontidos para cada conversa de execução
  scripts/              # auditoria de sessão e validação das skills
  android/              # projeto Kotlin/Compose, criado em KC-02
.agents/skills/         # skills descobertas pelo Codex
.claude/skills/         # skills descobertas pelo Claude Code
supabase/
  functions/
    ingest-health-connect/   # criada em KC-06
  migrations/                # schema do conector, criado em KC-05
src/                     # PWA atual; recebe tela isolada de teste em KC-04
```

O projeto Android será autônomo. Comandos npm continuam na raiz; comandos Gradle serão
executados somente em `connector/android/`.
