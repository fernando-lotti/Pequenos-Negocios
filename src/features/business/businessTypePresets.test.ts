import { describe, expect, it } from 'vitest'
import { getCostCategoryPreset } from './businessTypePresets'

describe('getCostCategoryPreset', () => {
  it('devolve categorias sugeridas pro subtipo escolhido', () => {
    const preset = getCostCategoryPreset('pipoqueiro')
    expect(preset.length).toBeGreaterThan(0)
    expect(preset.some((category) => category.name === 'Milho e óleo')).toBe(true)
  })

  it('devolve lista vazia quando não há subtipo escolhido', () => {
    expect(getCostCategoryPreset(null)).toEqual([])
  })

  it('devolve lista vazia pra um subtipo desconhecido, em vez de quebrar', () => {
    expect(getCostCategoryPreset('subtipo-que-nao-existe')).toEqual([])
  })
})
