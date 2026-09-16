/**
 * Construtores de dados para os testes.
 * Use `sobrescritas` para variar só o que importa em cada cenário:
 *
 *   assinaturaAtiva({ valorMensal: 99.90 })
 */

export function assinaturaAtiva(sobrescritas = {}) {
  return {
    id: 'assin-001',
    email: 'ana@exemplo.com',
    status: 'ATIVA',
    valorMensal: 39.9,
    cartao: { bandeira: 'visa', final: '4417' },
    vencimento: new Date('2026-03-01T00:00:00Z'),
    ...sobrescritas,
  };
}

export function assinaturaCancelada(sobrescritas = {}) {
  return assinaturaAtiva({
    id: 'assin-009',
    status: 'CANCELADA',
    ...sobrescritas,
  });
}
