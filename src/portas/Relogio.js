/**
 * PORTA — Relógio
 *
 * Existe para tirar o indeterminismo do tempo de dentro da regra de
 * negócio. Em produção devolve a data real; no teste, uma data fixa.
 *
 * @typedef {Object} Relogio
 * @property {() => Date} hoje
 */
export {};
