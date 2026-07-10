# SPEC — Kcalix Hybrid Icon System sem emojis

**Status:** piloto híbrido aprovado; publicação autorizada
**Branch:** `feature-icon-system`
**Fase:** pós-Ember Design System
**Data:** 2026-07-10

## Problema / motivação

O Ember tornou a interface mais consistente, mas o aplicativo ainda usa emojis como pictogramas em ações, títulos, estados, categorias, hábitos, exercícios, mensagens administrativas e no Kcal Coach. A aparência varia conforme o sistema operacional, mistura estilos visuais e reduz a percepção de acabamento profissional.

O inventário inicial encontrou cerca de 300 ocorrências estáticas em `src/`. Parte delas é somente apresentação, mas outra parte está incorporada em identificadores legados, como `"🏋️ Peito"`, `"🍞 Pães, Cereais & Raízes"` e nomes de refeições. A troca não pode alterar chaves persistidas nem quebrar histórico, cálculos, importações ou registros existentes no Supabase.

## Objetivo

Criar uma linguagem de ícones híbrida, consistente com o Ember e própria do Kcalix, removendo emojis de toda a interface controlada pelo aplicativo, inclusive Coach, onboarding, admin, treino, diário, hábitos, estados e feedbacks.

Emojis presentes em dados legados poderão continuar existindo internamente durante a transição, mas nunca serão usados como elemento visual nem exibidos no texto da interface.

## Direção visual aprovada

O sistema será híbrido, combinando três níveis visuais:

- **Identidade Kcalix:** assets autorais Ember 3D gerados para Coach, heróis e ilustrações de maior destaque.
- **Ícones semânticos coloridos:** Icons8 Color para navegação, categorias e demais conceitos recorrentes, com os arquivos incorporados localmente e a atribuição exigida pela licença gratuita.
- **Ícones SVG funcionais:** vetores locais e determinísticos para fechar, voltar, editar, excluir, adicionar, trocar, checar, alertar, abrir calendário, enviar e outras ações pequenas.
- Os ícones ilustrados seguirão o estilo **Ember 3D**: coloridos, amigáveis, arredondados, com volume suave, acabamento limpo e leitura imediata. Não serão copiadas imagens, composições ou traços específicos do Icons8.
- O 3D será controlado para não cair em aparência genérica: mesma câmera frontal em três quartos, mesma luz superior esquerda, materiais foscos com brilho pontual, contorno grafite, profundidade curta e silhuetas compactas.
- Elementos recorrentes da marca — pulso de energia, recortes grafite e pequenos acentos turquesa — conectam a família ao Kcalix e à interface Ember.
- Evitar plástico infantil, excesso de reflexo, realismo, cenários, sombras longas, muitos objetos dentro do mesmo ícone e detalhes que desapareçam em 32 px.
- A paleta visual parte dos tokens Ember: laranja, amarelo, magenta, turquesa, grafite e branco quente.
- Os masters ilustrados serão gerados em alta resolução, sem texto nem marca de terceiros, recortados com transparência e derivados para tamanhos otimizados.
- Tamanhos-base: 16–20 px para SVG funcional, 24–32 px para navegação/labels e 40–64 px para heróis e estados vazios.
- Botões somente com ícone exigem `aria-label` e `title` quando útil; imagens decorativas usam texto alternativo vazio.
- O robô `🤖` do Coach será substituído por um personagem/ícone autoral do Kcalix, preservando a sensação de presença do assistente.
- Logotipo, favicon e ícones PWA continuam separados deste sistema até decisão específica de marca.

## Escopo

### 1. Fundação da iconografia

- [x] Criar `src/assets/icons/kcalix/illustrated/` para os assets autorais coloridos.
- [x] Criar `src/assets/icons/kcalix/icons8/` para os assets Icons8 Color licenciados.
- [x] Criar `src/assets/icons/kcalix/system/` para SVGs funcionais locais.
- [x] Criar `src/components/icons/KcalixIcon.tsx` e `SystemIcon.tsx` para imagens semânticas/ilustradas e controles SVG.
- [ ] Criar `src/components/icons/iconCatalog.ts` para mapas semânticos usados por dados (`navigation`, `habit`, `meal`, `muscle`, `foodCategory`, `cardio`, `message`).
- [ ] Criar um manifesto de procedência com nome, finalidade, prompt, data, ferramenta e versão aprovada de cada asset gerado.
- [ ] Documentar o padrão de uso e impedir novos emojis visuais com um script de auditoria focado em JSX/labels exibidos.
- [ ] Preservar os ícones vetoriais atuais como fallback até cada asset novo ser aprovado.

### 2. Casca global e feedbacks

- [x] Substituir a navegação por Icons8 Color e o FAB/header/hero do Coach pelo personagem Kcalix aprovado para o piloto.
- [x] Substituir fechar, câmera, galeria, enviar e feedbacks do Coach por SVGs funcionais nesta primeira fatia.
- [ ] Expandir os SVGs funcionais para editar, excluir, trocar, histórico, ajuda, calendário, gráfico e instalação nas próximas fatias.
- [ ] Substituir `✅`, `❌`, `⚠️`, `⏳`, `🔥`, `🏆` e equivalentes por SVGs ou assets semânticos acompanhados de texto quando o estado não puder depender só da cor.
- [ ] Manter alvos de toque com no mínimo 44 × 44 px, mesmo quando o SVG tiver 16–24 px.
- [ ] Ajustar alinhamento e espaçamento para os ícones não alterarem a altura dos controles existentes.

### 3. Treino e dados legados de exercícios

- [ ] Separar identificador, label limpa e `iconKey` dos grupos musculares.
- [ ] Continuar aceitando grupos legados com ou sem prefixo emoji em `normalizeGroup`, importação e histórico.
- [ ] Exibir somente labels limpas (`Peito`, `Costas`, `Quadríceps`, etc.) com ícone vetorial opcional ao lado.
- [ ] Remover emojis dos nomes visíveis de cardio sem alterar seus IDs estáveis.
- [ ] Atualizar seletor, cards, progressão, templates, histórico e guia de volume.
- [ ] Preservar integralmente MEV/MAV/MRV, grupos secundários, volume, templates e registros antigos.

### 4. Diário, alimentos e hábitos

- [ ] Separar label limpa e `iconKey` das categorias do banco local de alimentos.
- [ ] Separar nome de refeição de seu ícone; os IDs `cafe`, `lanche1`, `almoco`, `lanche2`, `jantar` e `ceia` não mudam.
- [ ] Trocar os cinco ícones emoji de hábitos por chaves semânticas tipadas.
- [ ] Atualizar drawer, porções, histórico, análise de foto, extras e ações de IA.
- [ ] Preservar IDs, macros, alimentos customizados, diário e sincronização existentes.

### 5. Corpo, Mais, onboarding e instalação

- [ ] Substituir emojis de medidas, objetivos, macros, BMR/TDEE, conclusão, estados vazios e notificações.
- [ ] Trocar bolinhas emoji de objetivo por badges/ícones com texto; a interpretação não pode depender apenas da cor.
- [ ] Atualizar `CalcWizardModal`, check-in, evolução corporal, migração e `InstallPrompt`.
- [ ] Manter o logotipo e os arquivos PWA atuais; redesenho de marca/app icon fica fora desta SPEC.

### 6. Coach e Admin

- [ ] Remover emojis dos chips e textos de capacidade do Kcal Coach.
- [ ] Orientar as respostas automáticas do Coach a não acrescentarem emojis de status; conteúdo digitado pelo usuário não será alterado.
- [ ] Substituir emoji livre de broadcasts/enquetes por um seletor restrito de ícones semânticos.
- [ ] Adicionar `icon_key` a `app_messages` por migration aditiva e fazer backfill de mensagens existentes.
- [ ] Manter a coluna `emoji` temporariamente para compatibilidade e rollback, mas parar de exibi-la e de preenchê-la no frontend novo.
- [ ] Atualizar previews, cards, métricas, ações e estados do painel admin.

## Como o usuário interage

1. O usuário navega pelas mesmas telas e executa as mesmas ações de hoje.
2. Elementos de identidade passam a usar ícones ilustrados Kcalix; ações recorrentes usam SVGs consistentes, com texto ou rótulo acessível.
3. Categorias, refeições e grupos musculares aparecem com nomes limpos e, quando útil, um ícone vetorial.
4. Estados de sucesso, erro, alerta e carregamento usam forma, texto e cor Ember consistentes.
5. No admin, o autor escolhe um ícone profissional de uma lista curta em vez de digitar um emoji.
6. Mensagens antigas continuam abrindo normalmente, usando um ícone convertido ou um fallback seguro.

## Impacto no código

- **Componentes novos:** `AppIcon` híbrido e seletor de ícones do Admin.
- **Assets novos:** família ilustrada Kcalix e SVGs funcionais locais.
- **Catálogo novo:** mapas tipados de chave semântica → asset ilustrado ou componente SVG.
- **Componentes alterados:** casca global e componentes que hoje renderizam emojis, executados por fatias de tela.
- **Hooks:** tipos de hábitos, refeições, mensagens e labels passam a expor chave semântica ou label limpa; lógica de dados permanece nos hooks existentes.
- **Supabase:** migration aditiva `017_app_message_icon_key.sql`; nenhuma coluna existente será removida nesta sessão.
- **Dependências:** nenhuma dependência JavaScript adicional; Icons8 Color é incorporado como asset local com atribuição, e o pós-processamento de geração não entra no bundle.
- **TypeScript:** criar `IconKey`, `IconKind` e mapas exaustivos; não usar `any`.
- **Rotas:** nenhuma.
- **Regras de negócio:** nenhuma alteração em cálculos, IA, macros, treino, sincronização ou autenticação.

## Estratégia de compatibilidade

- Introduzir funções de apresentação que removem prefixos legados e resolvem `iconKey` sem modificar o valor persistido.
- Nunca usar o texto decorado como nova chave de domínio.
- Aceitar dados antigos durante toda a migração.
- Para valores desconhecidos, exibir label limpa e `CircleHelp` como fallback.
- Cobrir normalização/importação com testes antes de alterar `exerciseDb`, `foodDb` ou tipos compartilhados.
- Só considerar uma futura limpeza de dados após o frontend novo estar publicado e validado.

## Riscos e mitigação

- **Quebra de histórico por renomear grupos:** manter os valores canônicos atuais internamente e separar apresentação de persistência.
- **Inconsistência entre imagens geradas:** aprovar primeiro um guia visual e um piloto; cada novo asset usa o piloto como referência e passa por revisão lado a lado.
- **Perda de nitidez em tamanhos pequenos:** reservar raster ilustrado para tamanhos adequados e usar SVG em controles compactos.
- **Bundle maior:** gerar dimensões adequadas, comprimir assets, lazy-load quando aplicável e comparar peso com o baseline.
- **Semelhança com bibliotecas existentes:** descrever características visuais gerais, não fornecer assets de terceiros como alvo de cópia e registrar a procedência.
- **Exclusividade jurídica:** tratar os assets como criações geradas para o Kcalix, sem prometer unicidade absoluta; outputs de IA podem ser semelhantes a outros resultados.
- **Ícone sem significado claro:** manter label textual em ações importantes e testar os casos de botão somente com ícone.
- **Acessibilidade:** `aria-label` obrigatório em controles sem texto; status nunca comunicado apenas por cor.
- **Inconsistência durante a migração:** concluir e validar uma fatia inteira antes de iniciar a próxima; evitar tela parcialmente convertida.
- **Mensagens antigas com emoji:** mapear valores conhecidos e usar fallback sem expor o emoji original.
- **Regressão visual mobile:** revisar 375 px, alvos de toque, overflow e teclado virtual em cada fatia.

## Ordem de implementação proposta

1. Consolidar o guia visual Ember 3D a partir do painel conceitual aprovado como direção.
2. Criar, recortar e otimizar o Coach; selecionar e registrar os cinco assets Icons8 Color do piloto: Home, Diário, Treino, Corpo e Mais.
3. Fundação técnica + Nav + SVGs funcionais globais.
4. Treino e normalização de grupos/cardio.
5. Diário, categorias, refeições e hábitos.
6. Corpo, Mais, onboarding, instalação, Coach e Admin.
7. Migration de broadcasts, auditoria final, testes, QA visual e limpeza de resíduos.

Cada item será implementado e validado separadamente na mesma branch. Nenhuma fatia seguinte deve começar com build ou testes da anterior quebrados.

## Critérios de feito

- [ ] Nenhum emoji é renderizado pela interface controlada pelo Kcalix.
- [x] O Ember 3D é aprovado como referência visual oficial do sistema.
- [ ] O Coach e os cinco ícones Icons8 Color do piloto são aprovados visualmente em 375 px e em celular real.
- [ ] Cada asset ilustrado possui master, versão otimizada e entrada no manifesto de procedência.
- [x] Todo asset Icons8 incorporado possui procedência e atribuição; nenhum asset pago foi utilizado.
- [ ] Conteúdo digitado por usuário continua intacto.
- [ ] Dados legados com emojis continuam carregando, calculando e sincronizando corretamente.
- [ ] Todos os controles somente com ícone possuem nome acessível.
- [ ] Estados não dependem apenas de cor ou de um pictograma isolado.
- [ ] Navegação e ações preservam alvos de toque de no mínimo 44 × 44 px.
- [ ] Nenhuma chamada nova ao Supabase é feita diretamente em componentes.
- [ ] Migration de broadcasts é aditiva e possui estratégia de rollback.
- [ ] Testes de normalização, importação e cálculos continuam passando.
- [ ] `npm run build`, `npm run test` e lint escopado passam.
- [ ] O bundle é comparado com o baseline atual; aumento inesperado é investigado.
- [ ] QA visual aprovado em 375 px e em celular real.
- [ ] Busca final por emojis classifica qualquer ocorrência restante como dado legado, teste, comentário ou conteúdo do usuário — nunca UI renderizada.

## Fora de escopo

- Redesenhar logotipo, favicon ou ícones PWA.
- Copiar, redesenhar ou remover a atribuição de assets licenciados do Icons8 ou de outra biblioteca.
- Garantir exclusividade jurídica absoluta para outputs de IA.
- Usar imagens raster em controles pequenos onde SVG oferece melhor legibilidade.
- Alterar regras de cálculo, dados nutricionais ou treinamento.
- Remover imediatamente colunas/dados legados com emojis.
- Redesenhar layouts Ember já aprovados além dos ajustes necessários de iconografia e espaçamento.

## Decisões

- [x] Adotar o Kcalix Hybrid Icon System: Coach autoral Ember 3D, Icons8 Color para semântica visual e SVG local para controles.
- [x] Usar SVGs locais para ações e controles pequenos.
- [x] Criar com ChatGPT uma família autoral colorida para identidade, categorias e destaques.
- [x] Substituir também o `🤖` do Coach por um personagem/ícone próprio.
- [x] Implementar primeiro uma fatia-piloto com cinco itens de navegação e o Coach antes de produzir o catálogo completo.
- [x] Escolher a direção Ember 3D após comparar cinco alternativas planas.
- [x] Usar o primeiro painel 3D como referência de direção, sem tratá-lo como asset final recortável.
- [x] Aprovar visualmente o piloto implementado.
- [ ] Confirmar que logotipo e app icon/PWA permanecem como estão durante esta SPEC.
