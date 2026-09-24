// Etapa 2 — Tres perguntas, tres testes
import { test, expect, vi } from 'vitest';

import { renovarAssinatura } from '../src/renovarAssinatura.js';
import { AssinaturaCanceladaError } from '../src/erros.js';
import { assinaturaAtiva, assinaturaCancelada } from './fixtures.js';

test('P1 — vencimento calculado e exatamente 30 dias apos hoje', async () => {
  const dataHoje = new Date('2026-06-01T00:00:00Z');
  const dataEsperada = new Date('2026-07-01T00:00:00Z');

  const relogio = { hoje: () => dataHoje };
  // STUB — data fixa para calcular o vencimento esperado

  const gateway = { cobrar: vi.fn().mockResolvedValue({ status: 'aprovado' }) };
  // STUB — cobranca aprovada para chegar ao calculo do vencimento

  const repositorio = { salvar: vi.fn() };
  // DUMMY — nao participa desta verificacao

  const notificador = { enviar: vi.fn() };
  // DUMMY — nao participa desta verificacao

  const resultado = await renovarAssinatura(
    assinaturaAtiva(), repositorio, gateway, notificador, relogio
  );

  expect(resultado.vencimento).toEqual(dataEsperada);
});

test('P2 — notificador recebe a mensagem com a data de vencimento formatada', async () => {
  const relogio = { hoje: () => new Date('2026-06-01T00:00:00Z') };
  // STUB — data fixa para saber qual data vai aparecer na mensagem

  const gateway = { cobrar: vi.fn().mockResolvedValue({ status: 'aprovado' }) };
  // STUB — cobranca aprovada para que a notificacao seja disparada

  const repositorio = { salvar: vi.fn() };
  // DUMMY — nao participa desta verificacao

  const notificador = { enviar: vi.fn() };
  // MOCK — a assertiva verifica o conteudo exato da mensagem enviada

  const assinatura = assinaturaAtiva({ email: 'ana@exemplo.com' });

  await renovarAssinatura(assinatura, repositorio, gateway, notificador, relogio);

  expect(notificador.enviar).toHaveBeenCalledWith(
    'ana@exemplo.com',
    'Assinatura renovada até 01/07/2026'
  );
});

test('P3 — assinatura cancelada lanca erro sem tocar em nenhum servico', async () => {
  const gateway = new Proxy({}, {
    get: () => { throw new Error('gateway nao deveria ser chamado'); }
  });
  // DUMMY que explode — qualquer acesso quebra o teste

  const notificador = new Proxy({}, {
    get: () => { throw new Error('notificador nao deveria ser chamado'); }
  });
  // DUMMY que explode — qualquer acesso quebra o teste

  const repositorio = new Proxy({}, {
    get: () => { throw new Error('repositorio nao deveria ser chamado'); }
  });
  // DUMMY que explode — qualquer acesso quebra o teste

  const relogio = new Proxy({}, {
    get: () => { throw new Error('relogio nao deveria ser chamado'); }
  });
  // DUMMY que explode — qualquer acesso quebra o teste

  await expect(
    renovarAssinatura(assinaturaCancelada(), repositorio, gateway, notificador, relogio)
  ).rejects.toThrow(AssinaturaCanceladaError);
});
