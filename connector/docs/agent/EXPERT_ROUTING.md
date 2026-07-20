# Roteamento de especialistas do Connector

Selecionar especialistas pelo risco da issue, não pelo desejo de ter muitas opiniões. Cada
revisão deve receber o packet, diff ou log bruto necessário e produzir achados verificáveis.

## Perfis

| Perfil | Foco | Saída esperada |
|---|---|---|
| Android toolchain/build | Studio, SDK, JDK, Gradle, APK, ADB, emulador | diagnóstico reproduzível e comandos |
| Android architecture | Kotlin, Compose, lifecycle, estado, coroutines | riscos arquiteturais e testes |
| Health Connect | disponibilidade, permissões, record types, origem | compatibilidade e casos grant/deny/revoke |
| Mobile security | sessão, armazenamento, logs, rede, APK | threat findings e mitigação |
| Supabase security | auth, JWT, Edge Functions, grants, RLS | análise cross-tenant e idempotência |
| Integration/QA | Android → backend → PWA, atualização e rollback | matriz de casos e evidências faltantes |
| Product/privacy | finalidade, minimização, exclusão, limites não médicos | decisões e gaps de consentimento |

## Roteamento por issue

| Issue | Revisão principal | Revisão/gate adicional |
|---|---|---|
| KC-00 | Android architecture | produto/privacidade para decisões caras |
| KC-01 | Android toolchain/build | QA da reprodutibilidade |
| KC-02 | Android toolchain/build | Android architecture + QA de install/update |
| KC-03 | mobile security | Supabase security |
| KC-04 | integration/QA | Supabase security + produto |
| KC-05 | Health Connect | mobile security + privacidade |
| KC-06 | Health Connect | privacy + QA em aparelho real |
| KC-07 | product/privacy | mobile security + Supabase security |
| KC-08/09 | Supabase security | mobile security + integration/QA |
| KC-10/11 | Android architecture | Health Connect + integration/QA |
| KC-12/13 | integration/QA | produto/privacidade |
| KC-15 | integration/QA | build + security + privacy |

## Regras de delegação

- Delegar somente uma pergunta ou artefato delimitado.
- Não pedir a um especialista para executar a issue inteira.
- Não incluir a conclusão esperada no pedido de revisão.
- Não fornecer secrets, tokens, email completo, payload ou dado real de saúde.
- Preferir diff, interfaces, esquema redigido, saída de teste e passos de reprodução.
- Exigir arquivo/linha, cenário ou fonte oficial para achados.
- Verificar recomendações antes de editar.
- Registrar no packet: perfil consultado, escopo, achados aceitos, rejeitados e pendentes.

## Gates obrigatórios

Uma revisão independente é necessária antes de considerar concluída qualquer issue que:

- persista ou transmita sessão;
- crie migration, policy, grant, RPC ou Edge Function;
- solicite ou leia permissão Health Connect;
- envie dados de saúde ao backend;
- apague dados importados;
- gere APK release ou lide com keystore;
- altere o contrato entre Android, Supabase e PWA.

Se subagentes não estiverem disponíveis, fazer passes separados por perfil e registrar que não
houve independência de contexto. Isso não elimina testes objetivos nem revisão humana nos gates.
