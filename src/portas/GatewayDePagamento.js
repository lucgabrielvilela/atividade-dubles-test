/**
 * PORTA — Gateway de Pagamento
 *
 * Contrato definido por NÓS, em vocabulário do nosso domínio.
 * O provedor real (Stripe, Pagar.me, Cielo) fica atrás de um adaptador
 * em src/infra e nunca aparece nos testes unitários.
 *
 * @typedef {Object} ResultadoCobranca
 * @property {'aprovado'|'recusado'} status
 * @property {string} [motivo]
 *
 * @typedef {Object} GatewayDePagamento
 * @property {(valor: number, cartao: Object) => Promise<ResultadoCobranca>} cobrar
 */
export {};
