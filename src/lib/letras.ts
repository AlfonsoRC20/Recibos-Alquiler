const U = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve']
const D = ['','','','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa']
const C = ['','ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos']
function b(x: number): string {
  if (x < 30) return U[x]
  if (x < 100) return D[Math.floor(x / 10)] + (x % 10 ? ' y ' + U[x % 10] : '')
  if (x === 100) return 'cien'
  if (x < 1000) return C[Math.floor(x / 100)] + (x % 100 ? ' ' + b(x % 100) : '')
  if (x < 2000) return 'mil' + (x % 1000 ? ' ' + b(x % 1000) : '')
  return b(Math.floor(x / 1000)) + ' mil' + (x % 1000 ? ' ' + b(x % 1000) : '')
}
export function letras(n: number): string {
  const e = Math.floor(n), c = Math.round((n - e) * 100)
  const w = b(e).replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un')
  let s = w + (e === 1 ? ' euro' : ' euros')
  if (c) s += ' con ' + b(c) + (c === 1 ? ' céntimo' : ' céntimos')
  return s.charAt(0).toUpperCase() + s.slice(1)
}
