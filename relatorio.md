# Relatorio — Dubles de Teste

## Etapa 1 — Diagnostico da suite legada

### Classificacao dos dubles

**T1 — renova uma assinatura ativa**

| Colaborador | Duble | Adequado? | Por que |
|---|---|:---:|---|
| repositorio | Mock | Nao | Conta chamadas mas nao verifica o que foi salvo |
| gateway | Stub | Sim | Retorna "aprovado" pra conduzir o fluxo |
| notificador | Mock | Nao | Conta chamadas sem checar o conteudo |
| relogioFixo | Stub | Sim | Data fixa para o teste ser repetivel |

**T2 — calcula o novo vencimento**

| Colaborador | Duble | Adequado? | Por que |
|---|---|:---:|---|
| repositorio | Mock | Sim | E o unico canal pra observar o vencimento calculado |
| gateway | Stub | Sim | Conduz ao caminho aprovado |
| notificador | Dummy | Sim | Nao e usado neste teste |
| relogioFixo | Stub | Sim | Fixa a data de referencia |

**T3 — cartao recusado**

| Colaborador | Duble | Adequado? | Por que |
|---|---|:---:|---|
| repositorio | Dummy | Sim | Nao e inspecionado |
| gateway | Stub | Sim | Retorna "recusado" pra testar inadimplencia |
| notificador | Dummy | Sim | Nao e inspecionado nesse caminho |

**T4 — nao notifica quando recusado**

| Colaborador | Duble | Adequado? | Por que |
|---|---|:---:|---|
| notificador | Mock | Sim | Verificar que enviar NAO foi chamado e a regra de negocio em si |
| gateway | Stub | Sim | Configura o cenario de recusa |

**T5 — assinatura cancelada**

| Colaborador | Duble | Adequado? | Por que |
|---|---|:---:|---|
| repositorio | Spy silencioso | Nao | vi.fn() aceita chamadas sem avisar — deveria ser um dummy que explode |
| gatewayDummy | Spy silencioso | Nao | Mesmo problema: nome diz dummy mas nao impoe a restricao |
| notificadorDummy | Spy silencioso | Nao | Mesmo problema |

**T6 — envia o e-mail**

| Colaborador | Duble | Adequado? | Por que |
|---|---|:---:|---|
| sgMail (vi.mock) | Mock de lib externa | Nao | Viola "don't mock what you don't own": acopla o teste ao vocabulario interno do SendGrid |

### Experimento: DIAS_DO_CICLO = 45

Apenas **1 teste falhou** (T2). Os outros 5 passaram mesmo com a regra de negocio errada.

O T1 ficou verde porque so conta chamadas — nao verifica o vencimento calculado. Isso prova que uma suite verde nao e garantia de que os testes sao bons.

---

## Etapa 3 — Refatoracao da superespecificacao

### Numeros

| Medicao | Testes quebrados |
|---|---|
| Antes (suite legada, rename salvar -> persistir) | 2 |
| Depois (suite refatorada, mesmo rename) | 0 |

### O que sobreviveu e por que

T1 e T2 foram reescritos pra assertir no resultado da funcao, sem depender de `repositorio.salvar`.

O T4 mantem `expect(notificador.enviar).not.toHaveBeenCalled()` — essa assertiva nao tem como ser substituida por uma de resultado, porque a ausencia de notificacao nao aparece em nenhum valor de retorno. Ela e em si a regra de negocio.

---

## Etapa 4 — Teste de integracao do NotificadorSendgrid

O teste de integracao rodaria contra o sandbox do SendGrid com uma chave de API de teste real (via variavel de ambiente). Ele chamaria `notificador.enviar` e verificaria que a API aceitou a mensagem (status 202).

Esse teste nao fica no estagio unitario porque depende de rede externa e de credencial real. Rodar a cada commit seria lento e quebraria por falha de conexao sem que nenhum codigo tivesse mudado.
