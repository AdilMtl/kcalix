# Kcalix Hybrid Icon System

Esta pasta guarda a iconografia sem emojis do Kcalix.

## Pastas

- `source/` — arquivos originais recebidos ou gerados; ainda não usados pelo app.
- `illustrated/` — PNG/WebP finais aprovados para ícones 3D e ilustrações do Kcalix.
- `icons8/` — PNGs locais da família Icons8 Color usados em conceitos semânticos.
- `system/` — SVGs locais para ações compactas: fechar, editar, excluir, voltar, check e similares.

O aplicativo só deve importar assets de `illustrated/`, `icons8/` ou `system/`. Nunca importe diretamente de `source/`.

## Procedência do piloto Icons8 Color

Os arquivos abaixo são usados sob a licença gratuita do Icons8, com atribuição visível na tela Mais:

| Arquivo | Fonte |
|---|---|
| `nav-home.png` | https://icons8.com/icon/8ilAjtMMqxpi/home |
| `nav-diary.png` | https://icons8.com/icons/set/meal--style-color |
| `nav-workout.png` | https://icons8.com/icon/16887/dumbbell |
| `nav-body.png` | https://icons8.com/icon/24zCxqPWAsRk/bmi |
| `nav-more.png` | https://icons8.com/icon/flyFkP7sj07V/settings |

## Três níveis de asset

| Uso | Tamanho no app | O que gerar |
|---|---:|---|
| Navegação/categoria | 24–40 px | Um objeto simples, sem texto, uma silhueta fácil de reconhecer. |
| Destaque/estado vazio | 72–160 px | Ilustração 3D mais rica, ainda sem fundo ou cena. |
| Coach | 32–48 px (avatar) e 96–160 px (hero) | Gerar duas versões: busto/rosto simples e personagem completo. |

Os controles pequenos não são imagens geradas: use SVG em `system/`.

## Como gerar um novo arquivo

1. Gere **um único item por imagem**, sempre no mesmo chat do ChatGPT para preservar a direção visual.
2. Use canvas quadrado `1:1`, preferencialmente `1024 × 1024`.
3. Solicite fundo transparente. Se o fundo vier opaco, envie mesmo assim para `source/`; ele será recortado antes da aprovação.
4. Centralize o objeto e mantenha pelo menos 14% de margem vazia em cada lado.
5. Não use texto, letras, números, telas de dashboard, dados, etiquetas, cenário, mãos, sombras longas ou marca de terceiros.
6. Para navegação, mostre apenas o objeto principal: por exemplo, um halter para Treino ou uma tigela para Diário.
7. Use o Ember 3D: grafite fosco, laranja `#ff5c35`, magenta `#ff2f7d`, amarelo `#ffd166`, turquesa `#21d4b4` e branco quente; luz suave superior esquerda; profundidade curta; pequenos recortes/pulsos de energia.
8. Salve o original em `source/` antes de qualquer edição ou otimização.

## Nomes de arquivos

Arquivos recebidos em `source/`:

```text
nav-home-source-v1.png
nav-diary-source-v1.png
nav-workout-source-v1.png
nav-body-source-v1.png
nav-more-source-v1.png
coach-avatar-source-v1.png
coach-hero-source-v1.png
```

Arquivos aprovados em `illustrated/` e `icons8/`:

```text
nav-home.png
nav-diary.png
nav-workout.png
nav-body.png
nav-more.png
```

```text
coach-avatar.png
coach-hero.png
```

## Avaliação dos três primeiros estudos

- **Painel de treino + halter:** boa linguagem para hero/estado vazio; não serve como ícone de navegação porque inclui textos, dados e muitos detalhes pequenos.
- **Coach com tablet:** excelente base para `coach-hero`; gerar depois uma versão só de rosto/busto para `coach-avatar` e FAB.
- **Tigela nutricional:** boa base para `nav-diary`, desde que a versão final tenha só tigela + alimento simplificado, sem fundo, sombra de cenário ou garfo solto.

## Fluxo de aprovação

1. Coloque o original em `source/`.
2. Informe o nome do arquivo e a função pretendida.
3. O arquivo será revisado, recortado/otimizado se necessário e copiado para `illustrated/`.
4. Só então ele será adicionado ao catálogo de ícones e importado no app.
