import type { BusinessType } from './types'

// Este arquivo é o "coração" da ficha inicial: decide, a partir do tipo e do
// subtipo de negócio escolhidos, quais categorias de custo já vêm sugeridas
// (ver ADR "business_type é um enum fixo + preset em código" em
// docs/ARCHITECTURE.md). É só a sugestão inicial — o usuário pode renomear,
// desativar ou criar categorias novas a qualquer momento depois.

export interface BusinessTypeInfo {
  title: string
  description: string
  // Como chamar uma "venda"/"atendimento" nas telas de receita, de acordo
  // com o tipo de negócio.
  revenueUnitLabel: string
}

export const BUSINESS_TYPE_INFO: Record<BusinessType, BusinessTypeInfo> = {
  service_provider: {
    title: 'Prestador de serviços',
    description: 'Você cobra por atendimento, corrida ou hora — ex: motorista de app, maquiadora, cabeleireiro.',
    revenueUnitLabel: 'atendimento',
  },
  product_seller: {
    title: 'Comerciante de produto',
    description: 'Você compra insumo ou mercadoria e vende um produto — ex: pipoqueiro, ambulante.',
    // Singular, sem a palavra "vendida" — o rótulo é usado como "Quantos
    // {revenueUnitLabel}s?" (ver RevenueEntryForm.tsx), e "unidade vendida"
    // pluralizado viraria "unidade vendidas" (só o segundo substantivo no
    // plural, gramaticalmente errado).
    revenueUnitLabel: 'unidade',
  },
}

export interface BusinessSubtypeOption {
  id: string
  label: string
}

export const BUSINESS_SUBTYPES: Record<BusinessType, BusinessSubtypeOption[]> = {
  service_provider: [
    { id: 'motorista_app', label: 'Motorista de app' },
    { id: 'maquiadora', label: 'Maquiadora' },
    { id: 'cabeleireiro', label: 'Cabeleireiro(a)' },
    { id: 'outro_servico', label: 'Outro serviço' },
  ],
  product_seller: [
    { id: 'pipoqueiro', label: 'Pipoqueiro(a)' },
    { id: 'ambulante', label: 'Ambulante / revenda' },
    { id: 'outro_produto', label: 'Outro produto' },
  ],
}

export type CostCategoryKind = 'fixed' | 'variable'

export interface CostCategoryPreset {
  name: string
  kind: CostCategoryKind
}

const COST_CATEGORY_PRESETS: Record<string, CostCategoryPreset[]> = {
  motorista_app: [
    { name: 'Combustível', kind: 'variable' },
    { name: 'Manutenção do veículo', kind: 'fixed' },
    { name: 'Seguro / financiamento', kind: 'fixed' },
    { name: 'Taxas do aplicativo', kind: 'variable' },
  ],
  maquiadora: [
    { name: 'Produtos de maquiagem', kind: 'variable' },
    { name: 'Aluguel do espaço', kind: 'fixed' },
    { name: 'Deslocamento até o cliente', kind: 'variable' },
  ],
  cabeleireiro: [
    { name: 'Produtos (shampoo, tinta, etc.)', kind: 'variable' },
    { name: 'Aluguel da cadeira ou do salão', kind: 'fixed' },
    { name: 'Energia e água', kind: 'fixed' },
  ],
  pipoqueiro: [
    { name: 'Milho e óleo', kind: 'variable' },
    { name: 'Gás ou eletricidade', kind: 'fixed' },
    { name: 'Embalagens', kind: 'variable' },
    { name: 'Outros materiais', kind: 'variable' },
  ],
  ambulante: [
    { name: 'Mercadoria para revenda', kind: 'variable' },
    { name: 'Transporte', kind: 'variable' },
    { name: 'Taxa de ponto / licença', kind: 'fixed' },
  ],
  outro_servico: [
    { name: 'Materiais usados no atendimento', kind: 'variable' },
    { name: 'Custo fixo mensal', kind: 'fixed' },
  ],
  outro_produto: [
    { name: 'Mercadoria / insumo', kind: 'variable' },
    { name: 'Custo fixo mensal', kind: 'fixed' },
  ],
}

export function getCostCategoryPreset(businessSubtype: string | null): CostCategoryPreset[] {
  if (!businessSubtype) return []
  return COST_CATEGORY_PRESETS[businessSubtype] ?? []
}

// Preset de categorias de receita — diferente do de custo, a maioria dos
// subtipos não tem sugestão pronta (nem todo negócio precisa separar de
// onde vem a receita). Só faz sentido pra quem vende produtos variados sob
// o mesmo negócio, como o pipoqueiro (pipoca doce, salgada, praliné).
const REVENUE_CATEGORY_PRESETS: Record<string, string[]> = {
  pipoqueiro: ['Pipoca doce', 'Pipoca salgada', 'Praliné'],
}

export function getRevenueCategoryPreset(businessSubtype: string | null): string[] {
  if (!businessSubtype) return []
  return REVENUE_CATEGORY_PRESETS[businessSubtype] ?? []
}
