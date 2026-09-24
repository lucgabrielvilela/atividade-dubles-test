# Memorando Técnico — Dublês de Teste

**Atividade Prática · Testes de Software II**  
**Autores:** Lucas Gabriel da Silva Vilela  
**Data:** 24/09/2026  

---

### 1. Proximidade com a Escola Clássica ou Mockista

Após as refatorações das Etapas 3 e 4, a nossa suíte de testes ficou sensivelmente mais próxima da **escola clássica (Detroit / baseada em estado)**.

Na suíte legada inicial (`testes/renovarAssinatura.test.js`), predominava a escola mockista (London): testes como **T1** verificavam a orquestração e o fluxo de chamadas internas (`expect(gateway.cobrar).toHaveBeenCalledTimes(1)`, `expect(repositorio.salvar).toHaveBeenCalledTimes(1)` e `expect(notificador.enviar).toHaveBeenCalledTimes(1)`), sem checar se os dados finais estavam corretos. Além disso, no **T2** legado, a asserção do vencimento dependia exclusivamente de espionar o método de persistência (`expect(repositorio.salvar).toHaveBeenCalledWith(...)`).

Com a refatoração em `testes/renovarAssinatura.refatorado.test.js` (e em `testes/minhaSuite.test.js`):
- **T1** abandonou a contagem de chamadas e passou a verificar o estado do objeto resultante: `expect(resultado.status).toBe('ATIVA')`.
- **T2** (e **P1**) abandonou a inspeção do argumento de `salvar` e passou a avaliar diretamente o valor de retorno da função: `expect(resultado.vencimento).toEqual(new Date('2026-03-31T00:00:00Z'))`.
- Colaboradores que antes eram mocks de controle de fluxo viraram dummies (`repositorio` e `notificador` em T1 e T2).

A suíte passou a validar o **comportamento observável via resultado e estado**, desacoplando o teste do caminho interno percorrido pela unidade.

---

### 2. O Custo Dessa Aproximação: Caso Concreto

A aproximação da escola clássica eliminou a superespecificação, mas cobrou um preço claro: **a perda da detecção imediata de efeitos colaterais de persistência em nível unitário.**

**Caso concreto:**  
Em `testes/renovarAssinatura.refatorado.test.js`, tanto no **T1** quanto no **T2**, o repositório é fornecido como um dummy:
```javascript
const repositorio = { salvar: vi.fn() };
```
Como as assertivas agora inspecionam apenas as propriedades do objeto retornado em memória (`expect(resultado.status).toBe('ATIVA')` e `expect(resultado.vencimento).toEqual(...)`), se um desenvolvedor **remover ou comentar** a linha 43 de `src/renovarAssinatura.js`:
```javascript
// await repositorio.salvar(assinatura);
```
**Ambos os testes T1 e T2 continuarão passando 100% verdes**, mesmo que a assinatura renovada nunca tenha sido persistida no banco de dados. Para cobrir essa lacuna sem voltar aos mocks frágeis de interação, a escola clássica exige a introdução de dublês de estado mais trabalhosos (como um *Fake* em memória com verificação posterior de consulta) ou a delegação dessa garantia para testes de integração.

---

### 3. Testes Residuais Sensíveis a Refatoração Interna e Sua Justificativa

O teste que ainda quebraria diante de uma refatoração puramente interna de orquestração é o **T6** (assim como **P2** na suíte própria e **T4** na asserção de não envio):

```javascript
// T6 em testes/renovarAssinatura.refatorado.test.js
expect(notificador.enviar).toHaveBeenCalledWith(
  'ana@exemplo.com',
  'Assinatura renovada até 31/03/2026'
);
```

Se internamente o método do contrato `Notificador` for renomeado (ex.: para `notificarCliente`), se a assinatura de parâmetros mudar (ex.: recebendo um objeto de opções), ou se o envio for repassado para um barramento interno de eventos, **T6 quebrará**, embora a intenção do sistema permaneça idêntica.

**Defesa e Justificativa:**  
Essa asserção de interação **se justifica plenamente**. O `Notificador` representa uma **fronteira do sistema com o mundo externo (dependência não gerenciada / efeito colateral fora do processo)**.

Diferente do cálculo de datas ou da alteração de status (que alteram o estado do domínio e são retornados pela função), o envio de um e-mail para o cliente não deixa vestígios no estado interno do objeto `assinatura`. O efeito visível para o cliente é a chegada da notificação na sua caixa de entrada. Pelas regras de negócio ("o cliente é notificado com a nova data" na renovação e "o cliente NÃO é notificado" na recusa), a comunicação com esse colaborador **é o próprio objetivo observável da funcionalidade**. O uso de um **Mock** para inspecionar essa mensagem (e validar sua ausência em T4) é a única maneira viável de assegurar a regra em nível unitário sem disparar comunicações reais na rede.
