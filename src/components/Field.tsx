// Classe reutilizável pra inputs/selects/textareas — não um componente, porque
// os formulários do app aplicam essa mesma classe em elementos nativos
// diferentes (input, select) com props bem específicas de cada um.
export const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600'

export const labelClass = 'text-sm font-medium text-slate-700'
