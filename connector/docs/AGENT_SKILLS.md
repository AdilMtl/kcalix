# Skills de execução do Kcalix Connector

**Status:** prontas para uso antes da implementação Android
**Branch:** `feature/kcalix-connector`

## Objetivo

Orientar sessões novas, executar uma issue autocontida e encerrar o trabalho com evidências sem
depender da memória da conversa anterior. As skills não substituem PRD, spec ou packets; elas
obrigam o agente a localizar, aplicar e atualizar essas fontes de verdade.

## Skills

| Skill | Responsabilidade | Claude Code | Codex |
|---|---|---|---|
| `start-connector` | preparar branch, contexto, baseline, ações manuais e especialistas | `/start-connector` | `$start-connector` |
| `execute-connector-issue` | executar uma única `KC-XX`, testar e registrar evidências | `/execute-connector-issue KC-XX` | `$execute-connector-issue KC-XX` |
| `end-connector` | auditar, validar, atualizar packet e preparar handoff/commit | `/end-connector` | `$end-connector` |

O fluxo antigo em `.claude/commands/start.md` e `end.md` continua sendo o fluxo da PWA e não
deve ser usado para abrir ou fechar issues do Connector.

## Localização e portabilidade

O conteúdo é versionado em dois pontos porque as ferramentas usam diretórios de descoberta
diferentes:

- Claude Code: `.claude/skills/<skill>/SKILL.md`;
- Codex: `.agents/skills/<skill>/SKILL.md`.

As cópias correspondentes devem permanecer byte a byte iguais. Executar
`connector/scripts/validate-agent-skills.ps1` após qualquer alteração. Não usar symlinks:
o projeto roda no Windows/OneDrive e precisa continuar simples de clonar.

## Hierarquia de fontes

Quando houver conflito, usar esta ordem:

1. packet ativo em `connector/issues/`;
2. `connector/docs/SPEC.md` e `PRD.md`;
3. decisões registradas em `connector/docs/ANDROID_SETUP.md`;
4. referências de agentes em `connector/docs/agent/`;
5. skill de processo;
6. conversa ou memória informal.

A skill controla o processo. O packet controla o resultado e o escopo. As referências técnicas
controlam práticas compartilhadas, mas não autorizam antecipar outra issue.

## Fluxo completo

```text
/start-connector KC-XX
  -> validar branch e working tree
  -> ler packet e referências necessárias
  -> selecionar baseline, ações manuais e especialistas

/execute-connector-issue KC-XX
  -> confirmar dependências
  -> implementar somente o escopo
  -> revisar por especialidade
  -> testar cada superfície
  -> registrar evidências

/end-connector KC-XX
  -> revisar diff
  -> reexecutar testes finais
  -> atualizar status e handoff
  -> preparar commit local isolado
  -> nunca fazer merge/deploy implicitamente
```

Uma sessão pode terminar com a issue em andamento. Um handoff factual é preferível a reduzir
testes ou declarar conclusão sem evidência.

## Conhecimento carregado sob demanda

- `agent/ANDROID_ENGINEERING.md`: Kotlin, Compose, Gradle, segurança móvel e Health Connect;
- `agent/EXPERT_ROUTING.md`: especialidades e gates por issue/risco;
- `agent/TEST_MATRIX.md`: comandos, ambientes e evidências por superfície;
- packet `KC-XX`: contratos, arquivos, testes e passos manuais específicos.

Versões de SDKs, permissões, políticas Android/Google/Samsung e bibliotecas são temporais.
Verificar fontes oficiais na issue que fixa ou atualiza uma versão e registrar a data da decisão.

## Autorizações e limites

As skills podem ler, diagnosticar, editar e testar dentro do escopo aprovado da issue. Elas não
transformam uma solicitação de implementação em autorização automática para:

- trocar de branch carregando mudanças alheias;
- instalar software ou aceitar licenças;
- aplicar migration ou alterar Supabase remoto;
- instalar/limpar aplicativo em aparelho não identificado;
- conceder permissões pelo usuário;
- gerar ou mover keystore;
- assinar release;
- fazer push, merge, deploy ou publicação;
- enviar logs, tokens ou dados reais de saúde a especialistas.

## Validação das skills

Antes de usá-las na KC-00:

```powershell
powershell -ExecutionPolicy Bypass -File connector/scripts/validate-agent-skills.ps1
powershell -ExecutionPolicy Bypass -File connector/scripts/audit-connector-session.ps1 -Mode Start -Issue KC-00
```

Também validar cada pacote com o validador da ferramenta de criação de skills. O primeiro
forward-test real será a abertura da KC-00 em uma conversa limpa; ajustar as skills a partir de
falhas observadas, sem ampliar seu escopo por antecipação.

### Validação inicial — 2026-07-19

- seis pacotes aprovados pelo `quick_validate.py` da `skill-creator`;
- espelhamento Claude Code/Codex aprovado por `validate-agent-skills.ps1`;
- auditoria Start e End da KC-00 aprovada, preservando o aviso de status pendente;
- forward-test de `start-connector` detectou corretamente que KC-01 depende de KC-00 e não
  iniciou instalação;
- forward-test de `execute-connector-issue` parou no primeiro input não inferível da KC-00 — o
  modelo do telefone — sem editar arquivos;
- forward-test de `end-connector` manteve KC-00 pendente, não criou commit e produziu handoff
  acionável.

## Referências de autoria

A estrutura segue progressive disclosure, descrição com gatilhos claros, uma responsabilidade
por skill, scripts apenas para verificações determinísticas e referências carregadas quando
necessárias:

- [OpenAI — Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI — AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [Anthropic — Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
