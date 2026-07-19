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

O handoff que originou estes documentos permanece em
[`memory/handoff-kcalix-connector-android.md`](../memory/handoff-kcalix-connector-android.md).

## Estrutura prevista

```text
connector/
  README.md
  docs/                 # decisões, PRD, setup e backlog
  android/              # projeto Kotlin/Compose, criado em KC-02
supabase/
  functions/
    ingest-health-connect/   # criada em KC-06
  migrations/                # schema do conector, criado em KC-05
src/                     # PWA atual; só muda na fase de reconciliação KC-11
```

O projeto Android será autônomo. Comandos npm continuam na raiz; comandos Gradle serão
executados somente em `connector/android/`.
