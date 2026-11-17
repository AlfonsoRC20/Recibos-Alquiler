import { expect, test } from 'vitest'
import { letras } from './letras'
test('importes habituales', () => {
  expect(letras(600)).toBe('Seiscientos euros')
  expect(letras(570)).toBe('Quinientos setenta euros')
  expect(letras(545)).toBe('Quinientos cuarenta y cinco euros')
  expect(letras(1)).toBe('Un euro')
  expect(letras(21)).toBe('Veintiún euros')
  expect(letras(31)).toBe('Treinta y un euros')
})
test('decimales y miles', () => {
  expect(letras(60.5)).toBe('Sesenta euros con cincuenta céntimos')
  expect(letras(1250)).toBe('Mil doscientos cincuenta euros')
})
