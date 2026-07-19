# Fase Zero — aprender Android e provar o caminho ponta a ponta

## Objetivo do milestone

Antes de ler o relógio, comprovar em blocos pequenos que conseguimos:

```text
configurar ferramentas
-> compilar
-> emular
-> instalar
-> atualizar
-> autenticar no Kcalix
-> enviar input manual
-> visualizar na PWA
-> apagar o teste
-> conceder/revogar permissão Health Connect
```

Somente depois disso KC-06 adiciona leitura real, local e sem upload. Essa ordem isola falhas:
quando a leitura do relógio começar, Android, conta, rede, backend e PWA já estarão comprovados.

## Ordem obrigatória

1. [KC-00 — decisões e baseline](KC-00.md)
2. [KC-01 — toolchain Windows](KC-01.md)
3. [KC-02 — scaffold, emulador, instalação e atualização](KC-02.md)
4. [KC-03 — autenticação e conectividade](KC-03.md)
5. [KC-04 — input manual Android → PWA](KC-04.md)
6. [KC-05 — disponibilidade e permissão Health Connect](KC-05.md)
7. [KC-06 — leitura local no aparelho real](KC-06.md)

## Gate da Fase Zero

A fase termina somente quando:

- APK instala no emulador e telefone;
- segunda versão atualiza por cima preservando sessão/dado local de teste;
- login usa a mesma conta Kcalix;
- submissão manual aparece apenas para o usuário correto na PWA;
- reenvio não duplica e exclusão não toca dados manuais;
- disponibilidade e grant/deny/revoke do Health Connect são visíveis;
- PWA continua com build/testes passando;
- custos obrigatórios continuam em R$ 0.

O gate não exige leitura do Watch. Isso pertence a KC-06.
