/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  SUÍTE LEGADA — insumo da ETAPA 1                                  │
 * │                                                                    │
 * │  Esta suíte foi escrita por outra equipe. Ela executa e passa       │
 * │  inteira: `npm test` fica verde.                                   │
 * │                                                                    │
 * │  Nem todos os testes estão errados. Sua tarefa na Etapa 1 é        │
 * │  classificar cada dublê pela FINALIDADE que ele cumpre no teste,   │
 * │  e não pelo nome que a variável recebeu.                           │
 * │                                                                    │
 * │  NÃO altere este arquivo na Etapa 1. As alterações começam na      │
 * │  Etapa 3, e em cópias (ver ROTEIRO.md).                            │
 * └────────────────────────────────────────────────────────────────────┘
 */

import { test, expect, vi } from 'vitest';
import sgMail from '@sendgrid/mail';

import { renovarAssinatura } from '../src/renovarAssinatura.js';
import { NotificadorSendgrid } from '../src/infra/notificadorSendgrid.js';
import { AssinaturaCanceladaError } from '../src/erros.js';
import { assinaturaAtiva, assinaturaCancelada } from './fixtures.js';

vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn(),
  },
}));

const relogioFixo = { hoje: () => new Date('2026-03-01T00:00:00Z') };

// ── T1 ───────────────────────────────────────────────────────────────
test('T1 — renova uma assinatura ativa', async () => {
  const repositorio = { salvar: vi.fn() };
  const gateway = { cobrar: vi.fn().mockResolvedValue({ status: 'aprovado' }) };
  const notificador = { enviar: vi.fn() };

  await renovarAssinatura(
    assinaturaAtiva(), repositorio, gateway, notificador, relogioFixo
  );

  expect(gateway.cobrar).toHaveBeenCalledTimes(1);
  expect(repositorio.salvar).toHaveBeenCalledTimes(1);
  expect(notificador.enviar).toHaveBeenCalledTimes(1);
});

// ── T2 ───────────────────────────────────────────────────────────────
test('T2 — calcula o novo vencimento', async () => {
  const repositorio = { salvar: vi.fn() };
  const gateway = { cobrar: vi.fn().mockResolvedValue({ status: 'aprovado' }) };
  const notificador = { enviar: vi.fn() };

  await renovarAssinatura(
    assinaturaAtiva(), repositorio, gateway, notificador, relogioFixo
  );

  expect(repositorio.salvar).toHaveBeenCalledWith(
    expect.objectContaining({ vencimento: new Date('2026-03-31T00:00:00Z') })
  );
});

// ── T3 ───────────────────────────────────────────────────────────────
test('T3 — cartão recusado marca a assinatura como inadimplente', async () => {
  const repositorio = { salvar: vi.fn() };
  const gateway = {
    cobrar: vi.fn().mockResolvedValue({ status: 'recusado', motivo: 'saldo' }),
  };
  const notificador = { enviar: vi.fn() };

  const resultado = await renovarAssinatura(
    assinaturaAtiva(), repositorio, gateway, notificador, relogioFixo
  );

  expect(resultado.status).toBe('INADIMPLENTE');
});

// ── T4 ───────────────────────────────────────────────────────────────
test('T4 — não notifica quando a cobrança é recusada', async () => {
  const repositorio = { salvar: vi.fn() };
  const gateway = { cobrar: vi.fn().mockResolvedValue({ status: 'recusado' }) };
  const notificador = { enviar: vi.fn() };

  await renovarAssinatura(
    assinaturaAtiva(), repositorio, gateway, notificador, relogioFixo
  );

  expect(notificador.enviar).not.toHaveBeenCalled();
});

// ── T5 ───────────────────────────────────────────────────────────────
test('T5 — assinatura cancelada é rejeitada', async () => {
  const repositorio = { salvar: vi.fn() };
  const gatewayDummy = { cobrar: vi.fn() };
  const notificadorDummy = { enviar: vi.fn() };

  await expect(
    renovarAssinatura(
      assinaturaCancelada(), repositorio, gatewayDummy, notificadorDummy, relogioFixo
    )
  ).rejects.toThrow(AssinaturaCanceladaError);
});

// ── T6 ───────────────────────────────────────────────────────────────
test('T6 — envia o e-mail de confirmação', async () => {
  sgMail.send.mockResolvedValue([{ statusCode: 202 }]);

  const notificador = new NotificadorSendgrid('CHAVE-FAKE', 'no-reply@exemplo.com');
  await notificador.enviar('ana@exemplo.com', 'Assinatura renovada até 31/03/2026');

  expect(sgMail.send).toHaveBeenCalledWith(
    expect.objectContaining({
      to: 'ana@exemplo.com',
      subject: 'Assinatura renovada até 31/03/2026',
    })
  );
});
