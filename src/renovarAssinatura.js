import { AssinaturaCanceladaError } from './erros.js';
import { somarDias, formatarData } from './datas.js';

const DIAS_DO_CICLO = 30;

/**
 * Renova uma assinatura: cobra o valor mensal, estende a validade,
 * persiste o novo estado e notifica o cliente.
 *
 * Regras:
 *   1. Assinatura CANCELADA não pode ser renovada — lança AssinaturaCanceladaError.
 *   2. Se a cobrança não for aprovada, a assinatura vira INADIMPLENTE,
 *      é persistida e NÃO gera notificação.
 *   3. Se a cobrança for aprovada, o vencimento passa a ser a data
 *      corrente somada a 30 dias, o status vira ATIVA, o registro é
 *      persistido e o cliente é notificado.
 *
 * @param {Object}      assinatura   registro a renovar
 * @param {Object}      repositorio  porta de persistência  (ver src/portas)
 * @param {Object}      gateway      porta de pagamento     (ver src/portas)
 * @param {Object}      notificador  porta de notificação   (ver src/portas)
 * @param {Object}      relogio      porta de tempo         (ver src/portas)
 * @returns {Promise<Object>} a assinatura no estado resultante
 * @throws {AssinaturaCanceladaError}
 */
export async function renovarAssinatura(
  assinatura, repositorio, gateway, notificador, relogio
) {
  if (assinatura.status === 'CANCELADA') {
    throw new AssinaturaCanceladaError(assinatura.id);
  }

  const cobranca = await gateway.cobrar(assinatura.valorMensal, assinatura.cartao);

  if (cobranca.status !== 'aprovado') {
    assinatura.status = 'INADIMPLENTE';
    await repositorio.salvar(assinatura);
    return assinatura;
  }

  assinatura.vencimento = somarDias(relogio.hoje(), DIAS_DO_CICLO);
  assinatura.status = 'ATIVA';
  await repositorio.salvar(assinatura);

  await notificador.enviar(
    assinatura.email,
    `Assinatura renovada até ${formatarData(assinatura.vencimento)}`
  );

  return assinatura;
}
