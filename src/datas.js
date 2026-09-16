export function somarDias(data, dias) {
  const nova = new Date(data);
  nova.setUTCDate(nova.getUTCDate() + dias);
  return nova;
}

export function formatarData(data) {
  const [ano, mes, dia] = data.toISOString().slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}
