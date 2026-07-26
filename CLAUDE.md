# CLAUDE.md

As instruções deste projeto vivem em [`AGENTS.md`](AGENTS.md). **Leia aquele arquivo.**

Ele é a fonte única para todos os agentes — Claude Code, Codex e outros — para que
não existam duas versões da mesma regra divergindo com o tempo. Ao trabalhar em
arquivos dentro de `connector/`, leia também [`connector/AGENTS.md`](connector/AGENTS.md),
que tem precedência naquele escopo.

Específico do Claude Code: os comandos `/start`, `/spec`, `/feature`, `/fix`,
`/improve`, `/review`, `/end`, `/connector` e os demais estão definidos em
`.claude/commands/`.
