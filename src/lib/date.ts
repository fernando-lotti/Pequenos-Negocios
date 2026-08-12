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

export function getCurrentMonthKey(): string {
  return getMonthKeyFromIsoDate(getTodayAsIsoDate())
}

/** "2026-08" -> "agosto de 2026" */
export function formatMonthKeyLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}
