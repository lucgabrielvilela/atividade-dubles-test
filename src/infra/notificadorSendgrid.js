import sgMail from '@sendgrid/mail';
import { Notificador } from '../portas/Notificador.js';

export class NotificadorSendgrid extends Notificador {
  constructor(chaveApi, remetente) {
    super();
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

