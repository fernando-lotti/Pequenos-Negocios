// Usa os componentes LOCAIS da data (ano/mês/dia do fuso do navegador de
// quem está usando o app), não toISOString() — toISOString() sempre
// devolve a data em UTC, que fica um dia adiantada durante boa parte da
// noite no horário de Brasília. Isso fazia o app achar que "hoje" já era
// amanhã à noite.
export function getTodayAsIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatIsoDateAsBR(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('pt-BR')
}

/** Extrai "AAAA-MM" de uma data "AAAA-MM-DD" — usado pra agrupar lançamentos por mês. */
export function getMonthKeyFromIsoDate(isoDate: string): string {
  return isoDate.slice(0, 7)
}

/** "2026-08" -> "agosto de 2026" */
export function formatMonthKeyLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

/** Primeiro dia do mês atual, no formato "AAAA-MM-DD" — usado no atalho "Mês atual" dos relatórios. */
export function getFirstDayOfCurrentMonthIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

/** Último dia do mês atual, no formato "AAAA-MM-DD" — usado no atalho "Mês atual" dos relatórios. */
export function getLastDayOfCurrentMonthIso(): string {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

/** 1º de janeiro do ano atual, no formato "AAAA-MM-DD" — usado no atalho "Ano atual" dos relatórios. */
export function getFirstDayOfCurrentYearIso(): string {
  return `${new Date().getFullYear()}-01-01`
}

/** 31 de dezembro do ano atual, no formato "AAAA-MM-DD" — usado no atalho "Ano atual" dos relatórios. */
export function getLastDayOfCurrentYearIso(): string {
  return `${new Date().getFullYear()}-12-31`
}

// Soma meses a uma data "AAAA-MM-DD" — usado no parcelador automático de
// custos (ver features/costs/installments.ts). Se o dia não existir no mês
// de destino (ex: 31/01 + 1 mês), cai pro último dia daquele mês (28/02 ou
// 29/02), em vez de "estourar" pro mês seguinte como o construtor Date faz
// por padrão.
export function addMonthsToIsoDate(isoDate: string, monthsToAdd: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const targetMonthIndex = month - 1 + monthsToAdd
  const lastDayOfTargetMonth = new Date(year, targetMonthIndex + 1, 0).getDate()
  const clampedDay = Math.min(day, lastDayOfTargetMonth)
  const result = new Date(year, targetMonthIndex, clampedDay)
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, '0')}-${String(result.getDate()).padStart(2, '0')}`
}

// Detecta se o período é um mês ou ano inteiro pra mostrar um rótulo mais
// natural ("agosto de 2026", "ano de 2026") em vez da data início/fim crua —
// usado no card de lucro do relatório de período flexível (ver issue #6).
export function formatDateRangeLabel(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')

  const isFullYear =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === 0 &&
    start.getDate() === 1 &&
    end.getMonth() === 11 &&
    end.getDate() === 31

  if (isFullYear) return `ano de ${start.getFullYear()}`

  const lastDayOfStartMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
  const isFullMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === 1 &&
    end.getDate() === lastDayOfStartMonth

  if (isFullMonth) return formatMonthKeyLabel(getMonthKeyFromIsoDate(startDate))

  return `${formatIsoDateAsBR(startDate)} até ${formatIsoDateAsBR(endDate)}`
}
