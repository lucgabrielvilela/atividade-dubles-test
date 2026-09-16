import sgMail from '@sendgrid/mail';

/**
 * Adaptador de notificação por e-mail usando o SendGrid.
 *
 * Repare que este arquivo fala a linguagem do SendGrid: `to`, `from`,
 * `subject`, `text`. Isso é esperado num adaptador — ele existe
 * justamente para traduzir. O problema começa quando essa linguagem
 * vaza para o TESTE.
 */
export class NotificadorSendgrid {
  constructor(chaveApi, remetente) {
    sgMail.setApiKey(chaveApi);
    this.remetente = remetente;
  }

  async enviar(destinatario, mensagem) {
    await sgMail.send({
      to: destinatario,
      from: this.remetente,
      subject: mensagem,
      text: mensagem,
    });
  }
}
