export class AssinaturaCanceladaError extends Error {
  constructor(idAssinatura) {
    super(`Assinatura ${idAssinatura} está cancelada e não pode ser renovada.`);
    this.name = 'AssinaturaCanceladaError';
    this.idAssinatura = idAssinatura;
  }
}
