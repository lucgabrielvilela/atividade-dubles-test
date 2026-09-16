# Relatório — Etapa 1: Diagnóstico da Suíte Legada

**Disciplina:** Testes de Software II · Unidade I  
**Atividade:** Dublês de Teste  
**Arquivo analisado:** `testes/renovarAssinatura.test.js`

---

## 1. Classificação dos Dublês por Teste

> **Critério:** a classificação segue a *finalidade que o dublê cumpre naquele teste*, não o nome da variável.

---

### T1 — "renova uma assinatura ativa"

```js
const repositorio = { salvar: vi.fn() }
const gateway     = { cobrar: vi.fn().mockResolvedValue({ status: 'aprovado' }) }
const notificador = { enviar: vi.fn() }
// relogioFixo = { hoje: () => new Date('2026-03-01T00:00:00Z') }
```

| Colaborador | Qual dublê é, de fato | Adequado? | Observação |
|---|---|:---:|---|
| `repositorio` | **Mock** | ❌ Não | A asserção verifica apenas *quantas vezes* `salvar` foi chamado — não o que foi salvo nem o estado resultante. Acopla o teste ao caminho interno sem verificar nada relevante ao cliente. |
| `gateway` | **Stub** | ✅ Sim | Retorna uma resposta controlada (`'aprovado'`) para conduzir o fluxo ao caminho feliz; o retorno é o que importa, não a chamada em si. |
| `notificador` | **Mock** | ❌ Não | Verifica apenas o número de chamadas a `enviar`, sem checar o conteúdo da notificação; não detecta mensagem errada. |
| `relogioFixo` | **Stub** | ✅ Sim | Fornece uma data fixa e determinística para que o teste seja repetível. |

**Diagnóstico do T1:** inadequado — verifica apenas *se* os serviços foram chamados, sem verificar *o que* foi produzido. É um exercício de contagem de chamadas, não de comportamento.

---

### T2 — "calcula o novo vencimento"

```js
const repositorio = { salvar: vi.fn() }
const gateway     = { cobrar: vi.fn().mockResolvedValue({ status: 'aprovado' }) }
const notificador = { enviar: vi.fn() }
```

| Colaborador | Qual dublê é, de fato | Adequado? | Observação |
|---|---|:---:|---|
| `repositorio` | **Mock** | ✅ Sim | A asserção inspeciona o *argumento* passado a `salvar` — é o único canal para observar o resultado do cálculo de vencimento sem expor estado interno. |
| `gateway` | **Stub** | ✅ Sim | Conduz o fluxo ao caminho feliz para que o cálculo de vencimento ocorra. |
| `notificador` | **Dummy** | ✅ Sim | Não é inspecionado nem influencia o fluxo; existe apenas para satisfazer a assinatura da função. |
| `relogioFixo` | **Stub** | ✅ Sim | Fixa a data de referência em `2026-03-01`, permitindo verificar deterministicamente que o vencimento será `2026-03-31`. |

**Diagnóstico do T2:** adequado — inspecionar o argumento de `repositorio.salvar` é justificado porque é a única forma de observar o cálculo de vencimento; é um bom exemplo de uso de mock com propósito.

---

### T3 — "cartão recusado marca a assinatura como inadimplente"

```js
const repositorio = { salvar: vi.fn() }
const gateway     = { cobrar: vi.fn().mockResolvedValue({ status: 'recusado', motivo: 'saldo' }) }
const notificador = { enviar: vi.fn() }
```

| Colaborador | Qual dublê é, de fato | Adequado? | Observação |
|---|---|:---:|---|
| `repositorio` | **Dummy** | ✅ Sim | Não é inspecionado; existe só para a função não quebrar ao chamar `salvar`. |
| `gateway` | **Stub** | ✅ Sim | Retorna `status: 'recusado'` para conduzir ao caminho de inadimplência — exatamente o que o teste precisa. |
| `notificador` | **Dummy** | ✅ Sim | Não é inspecionado e seu retorno não altera o fluxo nesse caminho. |
| `relogioFixo` | **Stub** | ✅ Sim | Data fixa para determinismo; não influencia o desfecho testado. |

**Diagnóstico do T3:** adequado — a asserção incide sobre `resultado.status`, que é o comportamento visível ao cliente, sem acoplamento desnecessário ao caminho interno.

---

### T4 — "não notifica quando a cobrança é recusada"

```js
const repositorio = { salvar: vi.fn() }
const gateway     = { cobrar: vi.fn().mockResolvedValue({ status: 'recusado' }) }
const notificador = { enviar: vi.fn() }
```

| Colaborador | Qual dublê é, de fato | Adequado? | Observação |
|---|---|:---:|---|
| `repositorio` | **Dummy** | ✅ Sim | Não é inspecionado; existe só para satisfazer a assinatura. |
| `gateway` | **Stub** | ✅ Sim | Configura o cenário de recusa para permitir testar a ausência de notificação. |
| `notificador` | **Mock** | ✅ Sim | A asserção `not.toHaveBeenCalled()` é legítima: verificar que `enviar` *não foi chamado* é a própria resposta à pergunta do teste, e essa ausência importa ao cliente. |
| `relogioFixo` | **Stub** | ✅ Sim | Data fixa; não influencia o desfecho testado. |

**Diagnóstico do T4:** adequado — verificar a *ausência* de notificação é regra de negócio explícita, e o uso de mock para isso é a abordagem correta.

---

### T5 — "assinatura cancelada é rejeitada"

```js
const repositorio      = { salvar: vi.fn() }
const gatewayDummy     = { cobrar: vi.fn() }
const notificadorDummy = { enviar: vi.fn() }
```

| Colaborador | Qual dublê é, de fato | Adequado? | Observação |
|---|---|:---:|---|
| `repositorio` | **Spy silencioso** (deveria ser Dummy) | ❌ Não | `vi.fn()` aceita chamadas em silêncio; se o código passasse a chamar `salvar` antes de lançar a exceção, o teste continuaria verde sem avisar. |
| `gatewayDummy` | **Spy silencioso** (deveria ser Dummy) | ❌ Não | O nome sugere dummy, mas `vi.fn()` não impõe a restrição "não pode ser chamado"; qualquer acesso acidental ao gateway passa despercebido. |
| `notificadorDummy` | **Spy silencioso** (deveria ser Dummy) | ❌ Não | Mesma falha: não explode ao ser invocado, tornando o teste cego a regressões que toquem o notificador antes da exceção. |
| `relogioFixo` | **Stub** | ✅ Sim | Coerente com o restante da suíte. |

**Diagnóstico do T5:** inadequado — os três colaboradores deveriam ser dummies verdadeiros (objetos que lançam erro ao ser chamados), garantindo que qualquer acesso acidental a serviços antes do lançamento da exceção seja imediatamente denunciado.

---

### T6 — "envia o e-mail de confirmação"

```js
vi.mock('@sendgrid/mail', ...)   // mock do módulo no topo do arquivo
const notificador = new NotificadorSendgrid('CHAVE-FAKE', 'no-reply@exemplo.com')
```

| Colaborador | Qual dublê é, de fato | Adequado? | Observação |
|---|---|:---:|---|
| `sgMail` (via `vi.mock`) | **Mock de biblioteca externa** | ❌ Não | O teste verifica chamadas a `sgMail.send` com detalhes de vocabulário SendGrid (`to`, `subject`), violando *don't mock what you don't own* — o teste está acoplado à implementação interna do adaptador, não ao contrato do domínio. |

**Diagnóstico do T6:** inadequado — ao simular `@sendgrid/mail` e inspecionar seu vocabulário interno, o teste quebra a cada mudança de implementação do adaptador mesmo quando o comportamento visível ao domínio não mudou.

---

## 2. Tabela-Resumo Consolidada

| Teste | Colaborador | Dublê de fato | Adequado? | Problema / Justificativa |
|---|---|---|:---:|---|
| T1 | `repositorio` | Mock | ❌ | Verifica apenas contagem de chamadas, sem checar o que foi salvo |
| T1 | `gateway` | Stub | ✅ | Conduz ao fluxo aprovado; retorno é o que importa |
| T1 | `notificador` | Mock | ❌ | Verifica apenas contagem, sem checar o conteúdo da notificação |
| T1 | `relogioFixo` | Stub | ✅ | Fornece data fixa e determinística |
| T2 | `repositorio` | Mock | ✅ | Inspeciona o argumento salvo — único canal para observar o cálculo |
| T2 | `gateway` | Stub | ✅ | Conduz ao caminho feliz para que o cálculo ocorra |
| T2 | `notificador` | Dummy | ✅ | Não inspecionado, não influencia o fluxo |
| T2 | `relogioFixo` | Stub | ✅ | Fixa a data de referência para verificação determinística |
| T3 | `repositorio` | Dummy | ✅ | Não inspecionado, existe só para satisfazer a assinatura |
| T3 | `gateway` | Stub | ✅ | Retorna `'recusado'` para conduzir ao caminho de inadimplência |
| T3 | `notificador` | Dummy | ✅ | Não inspecionado nesse caminho |
| T3 | `relogioFixo` | Stub | ✅ | Data fixa; não influencia o desfecho testado |
| T4 | `repositorio` | Dummy | ✅ | Não inspecionado, existe só para satisfazer a assinatura |
| T4 | `gateway` | Stub | ✅ | Configura o cenário de recusa |
| T4 | `notificador` | Mock | ✅ | Verificar a *ausência* de chamada é regra de negócio explícita |
| T4 | `relogioFixo` | Stub | ✅ | Data fixa; não influencia o desfecho testado |
| T5 | `repositorio` | Spy silencioso (deveria ser Dummy) | ❌ | `vi.fn()` aceita chamadas em silêncio; não detecta acesso acidental |
| T5 | `gatewayDummy` | Spy silencioso (deveria ser Dummy) | ❌ | Nome é `gatewayDummy` mas não impõe a restrição de não ser chamado |
| T5 | `notificadorDummy` | Spy silencioso (deveria ser Dummy) | ❌ | Não explode ao ser chamado; cego a regressões nesse caminho |
| T5 | `relogioFixo` | Stub | ✅ | Coerente com o restante da suíte |
| T6 | `sgMail` (via `vi.mock`) | Mock de biblioteca externa | ❌ | Viola *don't mock what you don't own*; acopla ao vocabulário interno do SendGrid |

---

## 3. Experimento Obrigatório

### Procedimento executado

```bash
# 1. Em src/renovarAssinatura.js, DIAS_DO_CICLO foi trocado de 30 para 45
npm test

# 2. DIAS_DO_CICLO foi restaurado para 30 após o experimento
```

### Resultado

| Métrica | Valor |
|---|---|
| Testes que **falharam** | **1** |
| Testes que **passaram** | **5** |
| Teste que falhou | **T2 — "calcula o novo vencimento"** |

**Saída relevante da falha:**
```
× T2 — calcula o novo vencimento
  expected repositorio.salvar to have been called with:
    ObjectContaining { vencimento: 2026-03-31T00:00:00.000Z }
  Received:
    { ..., vencimento: 2026-04-15T00:00:00.000Z }
```

### Análise: o T1 verifica alguma coisa que importe ao cliente?

**Não.** Com `DIAS_DO_CICLO = 45`, o T1 permaneceu **verde**.

O T1 conta apenas o número de chamadas a `gateway.cobrar`, `repositorio.salvar` e `notificador.enviar`. Uma alteração que mudou o vencimento calculado de 30 para 45 dias passou completamente despercebida porque o T1 não verifica *o que* foi calculado, salvo ou enviado — apenas *se* e *quantas vezes* os serviços foram invocados.

O experimento comprova que **uma suíte verde não é evidência de que os testes sejam bons**: cinco testes passaram enquanto a regra de negócio mais central (o cálculo do novo vencimento) estava incorreta. Apenas o T2 — que inspeciona o argumento concreto passado a `repositorio.salvar` — foi capaz de detectar a regressão.

---

*`DIAS_DO_CICLO` restaurado para `30` após o experimento. Nenhum arquivo de teste ou produção foi alterado.*
