# Atividade Prática — Dublês de Teste

**Testes de Software II · Unidade I**
Entrega até o início da Aula 5.

---

## 1. Por que esta atividade existe

Na Aula 3 você viu os cinco tipos de dublê num slide. Reconhecer um dublê num slide e **escolher** o dublê certo diante de um problema real são coisas diferentes, e a segunda é a que vai ser cobrada de você no estágio, no emprego e na avaliação.

A dificuldade da atividade não está na sintaxe. `vi.fn()` você aprende em vinte minutos de documentação. A dificuldade está em decidir, para cada colaborador de cada teste, **qual dublê usar e por quê** — e em conseguir defender essa decisão.

Por isso a atividade começa lendo o trabalho dos outros antes de você escrever o seu.

---

## 2. O que você precisa saber antes de começar

Da Aula 3:

- A taxonomia de Meszaros: **dummy, fake, stub, spy, mock**
- O critério que separa spy de mock: *se a interação não tivesse acontecido, por que motivo o teste falharia?*
- A diretriz **don't mock what you don't own**
- O que é **superespecificação** e por que ela transforma a suíte em cimento

Se algum desses pontos estiver nebuloso, revise o material antes de abrir o repositório. A atividade não reensina esses conceitos.

---

## 3. O sistema

Você recebe o módulo de **renovação de assinaturas** de um serviço por assinatura.

### A regra de negócio

```
1. Assinatura CANCELADA não pode ser renovada — lança AssinaturaCanceladaError.

2. Se a cobrança NÃO for aprovada:
     status vira INADIMPLENTE
     o registro é persistido
     o cliente NÃO é notificado

3. Se a cobrança for aprovada:
     vencimento = data corrente + 30 dias
     status vira ATIVA
     o registro é persistido
     o cliente é notificado com a nova data
```

### A função

```js
renovarAssinatura(assinatura, repositorio, gateway, notificador, relogio)
```

Quatro colaboradores chegam pelo construtor da chamada. Isso não é acidente: é o que torna a função testável. Leia `src/renovarAssinatura.js` inteira antes de qualquer coisa.

### O mapa do repositório

```
src/
  renovarAssinatura.js      a função sob teste
  erros.js                  AssinaturaCanceladaError
  datas.js                  somarDias, formatarData
  portas/                   contratos definidos por NÓS
    RepositorioDeAssinaturas.js
    GatewayDePagamento.js
    Relogio.js
    Notificador.js          ← incompleto de propósito (Etapa 4)
  infra/
    notificadorSendgrid.js  adaptador que usa @sendgrid/mail

testes/
  renovarAssinatura.test.js suíte legada — insumo da Etapa 1
  fixtures.js               construtores de dados
```

---

## 4. Preparação do ambiente

```bash
npm install
npm test
```

A suíte deve ficar **inteiramente verde**: 6 testes, 6 passando.

Guarde essa informação, porque ela é o ponto de partida da atividade: **uma suíte verde não é evidência de que os testes sejam bons.**

---

## 5. As cinco etapas

### ETAPA 1 — Diagnóstico da suíte legada
**Individual · em laboratório · 40 min · não altere nenhum arquivo**

A suíte em `testes/renovarAssinatura.test.js` foi escrita por outra equipe. Ela passa inteira. **Nem todos os testes estão errados.**

Para cada um dos seis testes, preencha uma linha:

| Teste | Colaborador | Qual dublê é, de fato | Está adequado? | Se não, qual o problema |
|---|---|---|---|---|
| T1 | `repositorio` | | | |
| T1 | `gateway` | | | |
| ... | | | | |

**Regras da etapa:**

1. Classifique pela **finalidade que o dublê cumpre naquele teste**, não pelo nome da variável. Um objeto chamado `notificadorDummy` pode perfeitamente não ser um dummy.
2. Para cada teste que julgar inadequado, escreva **uma frase** dizendo qual defeito ele tem. Não proponha correção ainda.
3. Se julgar um teste adequado, diga em uma frase por que ele é um bom exemplo.

**Experimento obrigatório desta etapa.** Antes de concluir, faça o seguinte e registre o resultado no relatório:

```bash
# em src/renovarAssinatura.js, troque DIAS_DO_CICLO de 30 para 45
npm test
```

Quantos testes falharam? Quais? Volte o valor para 30 depois.

Esse experimento responde sozinho a pergunta mais importante da etapa: **o T1 verifica alguma coisa que importe ao cliente?**

---

### ETAPA 2 — Três perguntas, três testes
**Em duplas · início em laboratório**

Crie o arquivo `testes/minhaSuite.test.js` e escreva **um teste para cada pergunta abaixo**.

| # | Pergunta que o teste deve responder |
|---|---|
| **P1** | O novo vencimento é exatamente 30 dias após a data corrente? |
| **P2** | O cliente é notificado com a data correta dentro da mensagem? |
| **P3** | Uma assinatura cancelada é rejeitada **sem tocar em nenhum serviço**? |

**Exigências:**

1. Para **cada colaborador** de **cada teste**, escreva um comentário de uma linha declarando o tipo de dublê e a justificativa:
   ```js
   const gateway = { cobrar: vi.fn().mockResolvedValue({ status: 'aprovado' }) }
   // STUB — só preciso que a cobrança seja aprovada para chegar ao cálculo
   ```
2. As três respostas devem usar **tipos diferentes** de dublê como protagonista. Se você usou mock nas três, releia a Aula 3 antes de entregar — a pergunta é que determina a escolha.
3. Na P3, pergunte-se o que aconteceria se o código **passasse** a chamar um dos serviços. Seu teste avisaria? Se não avisaria, ele não está respondendo à pergunta que foi feita.

---

### ETAPA 3 — Refatorar a superespecificação
**Em duplas · extraclasse**

Copie a suíte legada para `testes/renovarAssinatura.refatorado.test.js` e reescreva **T1 e T2** de modo que a suíte deixe de depender do caminho interno da função.

**Medição obrigatória — faça antes e depois:**

```bash
# 1. MEDIÇÃO INICIAL
#    Renomeie repositorio.salvar para repositorio.persistir em
#    src/renovarAssinatura.js e nos objetos-dublê dos testes,
#    SEM alterar mais nada. Isto é refatoração pura: o
#    comportamento visível ao cliente não muda em nada.
npm test          # anote quantos testes quebraram

# 2. Desfaça o rename. Refatore T1 e T2.

# 3. MEDIÇÃO FINAL
#    Repita exatamente o mesmo rename.
npm test          # anote quantos testes quebraram agora
```

**Entregue no relatório os dois números.** Se forem iguais, a refatoração não atingiu o objetivo.

**Entregue também** uma justificativa curta: *alguma asserção de interação teve de sobreviver? Qual, e por quê?* Nem tudo é conversível — parte do trabalho é saber identificar o que não é.

---

### ETAPA 4 — Extrair o contrato do notificador
**Em duplas · extraclasse**

O teste **T6** verifica `NotificadorSendgrid` simulando a biblioteca `@sendgrid/mail`.

1. Escreva o contrato em `src/portas/Notificador.js`, **em vocabulário do nosso domínio**. Pergunta-guia: se amanhã trocarmos o SendGrid por outro provedor, esse contrato precisaria mudar? Se sim, ele está errado.
2. Ajuste `NotificadorSendgrid` para respeitar o contrato.
3. Reescreva o teste unitário de `renovarAssinatura` dublando **o seu contrato**, nunca a biblioteca.
4. **Descreva em texto** (não implemente) o teste de integração de `NotificadorSendgrid`: contra o quê ele roda, o que verifica, em que estágio do pipeline ficaria e por que não roda a cada commit.

> Nesta etapa, `vi.mock('@sendgrid/mail')` não pode aparecer em nenhum arquivo da entrega, em nenhuma forma.

---

### ETAPA 5 — Memorando técnico
**Em duplas · extraclasse · máximo uma página**

Responda, com evidência tirada da sua própria entrega:

1. Depois das refatorações, sua suíte ficou mais próxima da escola **clássica** ou da **mockista**?
2. O que essa aproximação **custou**? Cite um caso concreto do seu código.
3. Sobrou algum teste que quebraria numa refatoração puramente interna? Ele se justifica? Defenda.

Este memorando é o ingresso da Aula 4. Leve-o impresso.

---

## 6. O que entregar

Um repositório versionado contendo:

```
relatorio.md                       Etapas 1, 3 (justificativa + números) e 4 (item 4)
memorando.md                       Etapa 5
testes/minhaSuite.test.js          Etapa 2
testes/renovarAssinatura.refatorado.test.js   Etapa 3
src/portas/Notificador.js          Etapa 4
src/infra/notificadorSendgrid.js   Etapa 4
```

Antes de entregar, rode `npm test` uma última vez. **Entrega cuja suíte não executa é devolvida sem correção.**

---

## 7. Como você será avaliado

| Etapa | Critério | Peso |
|---|---|---|
| 1 | Classificação pela finalidade; identificação correta dos testes inadequados; experimento registrado | 25% |
| 2 | Três tipos distintos de dublê, adequados a cada pergunta; justificativa por colaborador | 30% |
| 3 | Redução mensurável no número de testes quebrados; justificativa do que sobreviveu | 20% |
| 4 | Contrato em vocabulário de domínio; teste dublando o contrato; descrição do teste de integração | 15% |
| 5 | Posicionamento defendido com evidência do próprio código | 10% |

### Condições que zeram a etapa

- **Etapa 2, P3** entregue com `vi.fn()` nos serviços que não devem ser tocados.
- **Etapa 4** mantendo `vi.mock('@sendgrid/mail')` em qualquer arquivo.
- Qualquer etapa cuja suíte não execute.

---

## 8. Perguntas que você provavelmente vai fazer

**"O T6 funciona e fica verde. Qual é o problema?"**
Funciona verificando o quê? Escreva a resposta a essa pergunta e você terá o diagnóstico.

**"Posso usar mock em tudo? Sempre passa."**
Pode. E na primeira refatoração de método privado sua suíte inteira fica vermelha sem que nada tenha quebrado para o usuário. A Etapa 3 mede exatamente isso.

**"Na P3, por que não posso usar `vi.fn()`?"**
Porque `vi.fn()` aceita ser chamado em silêncio. Se o código passar a chamar aquele serviço, seu teste continua verde e você não fica sabendo. Pense em qual valor faria o teste **explodir** se o serviço fosse tocado.

**"O relógio conta como dublê?"**
Conta. E vale a pergunta: qual tipo ele é nos testes da suíte legada?

**"Preciso implementar o teste de integração da Etapa 4?"**
Não. Descreva em texto o que ele faria, contra o quê rodaria e por que não pertence ao estágio unitário.

---

## 9. Uma última orientação

Em toda etapa, quando estiver em dúvida sobre qual dublê usar, volte à mesma pergunta:

> **Se essa interação não acontecesse, por que motivo o meu teste falharia?**

Se a resposta for *"porque o resultado ficaria errado"*, você precisa de stub ou fake, e a asserção vai no resultado.
Se a resposta for *"porque a chamada não teria ocorrido"*, você precisa de mock — e está aceitando o custo de acoplar o teste ao caminho interno.
Se a resposta for *"não falharia"*, aquele colaborador é um dummy, e ele deve ser escrito de modo que qualquer uso acidental quebre o teste.
