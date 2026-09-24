// Etapa 3 e 4 — Refatoracao da superespecificacao + contrato do Notificador

import { test, expect, vi } from 'vitest';

import { renovarAssinatura } from '../src/renovarAssinatura.js';
import { AssinaturaCanceladaError } from '../src/erros.js';
import { assinaturaAtiva, assinaturaCancelada } from './fixtures.js';


const relogioFixo = { hoje: () => new Date('2026-03-01T00:00:00Z') };

// ── T1
test('T1 — renova uma assinatura ativa', async () => {
  const repositorio = { salvar: vi.fn() };
  // DUMMY — nao participa da verificacao

  const gateway = { cobrar: vi.fn().mockResolvedValue({ status: 'aprovado' }) };
  // STUB — cobranca aprovada para acionar o caminho de renovacao

  const notificador = { enviar: vi.fn() };
  // DUMMY — nao participa da verificacao

  const resultado = await renovarAssinatura(
    assinaturaAtiva(), repositorio, gateway, notificador, relogioFixo
  );

  expect(resultado.status).toBe('ATIVA');
});

// ── T2
test('T2 — calcula o novo vencimento', async () => {
  const repositorio = { salvar: vi.fn() };
  // DUMMY — nao participa da verificacao

  const gateway = { cobrar: vi.fn().mockResolvedValue({ status: 'aprovado' }) };
  // STUB — cobranca aprovada para chegar ao calculo do vencimento

  const notificador = { enviar: vi.fn() };
  // DUMMY — nao participa da verificacao

  const resultado = await renovarAssinatura(
    assinaturaAtiva(), repositorio, gateway, notificador, relogioFixo
  );

  expect(resultado.vencimento).toEqual(new Date('2026-03-31T00:00:00Z'));
});

// ── T3 
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

// ── T4 
test('T4 — não notifica quando a cobrança é recusada', async () => {
  const repositorio = { salvar: vi.fn() };
  const gateway = { cobrar: vi.fn().mockResolvedValue({ status: 'recusado' }) };
  const notificador = { enviar: vi.fn() };

  await renovarAssinatura(
    assinaturaAtiva(), repositorio, gateway, notificador, relogioFixo
  );

  expect(notificador.enviar).not.toHaveBeenCalled();
});

// ── T5 
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

// ── T6
test('T6 — cliente e notificado com a mensagem certa apos renovacao aprovada', async () => {
  const relogio = { hoje: () => new Date('2026-03-01T00:00:00Z') };
  // STUB — data fixa para prever o conteudo da mensagem

  const gateway = { cobrar: vi.fn().mockResolvedValue({ status: 'aprovado' }) };
  // STUB — cobranca aprovada para o caminho de notificacao ser executado

  const repositorio = { salvar: vi.fn() };
  // DUMMY — nao participa desta verificacao

  const notificador = { enviar: vi.fn() };
  // MOCK — dublê do contrato Notificador; a assertiva verifica destinatario e mensagem

  const assinatura = assinaturaAtiva({ email: 'ana@exemplo.com' });

  await renovarAssinatura(assinatura, repositorio, gateway, notificador, relogio);

  expect(notificador.enviar).toHaveBeenCalledWith(
    'ana@exemplo.com',
    'Assinatura renovada até 31/03/2026'
  );
});
