# Atividade Prática — Dublês de Teste

**Testes de Software II · Unidade I**
Módulo de renovação de assinaturas · Node.js + Vitest

---

## Comece por aqui

1. Leia **[ROTEIRO.md](./ROTEIRO.md)** por inteiro antes de escrever qualquer linha.
2. Prepare o ambiente:

```bash
npm install
npm test
```

Você deve ver **6 testes, 6 passando**. Se não vir, avise o docente antes de prosseguir.

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm test` | Executa a suíte uma vez |
| `npm run test:watch` | Reexecuta a cada alteração de arquivo |

---

## Estrutura

```
src/
  renovarAssinatura.js         a função sob teste
  erros.js                     AssinaturaCanceladaError
  datas.js                     somarDias, formatarData
  portas/                      contratos definidos por nós
  infra/notificadorSendgrid.js adaptador de e-mail

testes/
  renovarAssinatura.test.js    suíte legada (insumo da Etapa 1)
  fixtures.js                  construtores de dados
```

---

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

---

## Aviso

A suíte legada em `testes/renovarAssinatura.test.js` passa inteira — e ainda assim tem problemas. Descobrir quais é a Etapa 1.

Não altere esse arquivo até a Etapa 3, e mesmo lá trabalhe em uma cópia.
