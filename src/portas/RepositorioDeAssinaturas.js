/**
 * PORTA — Repositório de Assinaturas
 *
 * Contrato definido por NÓS. Qualquer implementação (Postgres, memória,
 * arquivo) precisa respeitá-lo. Nos testes unitários, é este contrato
 * que se substitui — nunca o driver do banco.
 *
 * @typedef {Object} RepositorioDeAssinaturas
 * @property {(assinatura: Object) => Promise<void>} salvar
 * @property {(id: string) => Promise<Object|undefined>} buscar
 */
export {};
