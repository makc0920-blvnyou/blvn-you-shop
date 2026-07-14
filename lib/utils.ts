export function formatPrice(price: number): string {
  return `${price.toFixed(2)} BYN`
}

export function generateOrderNumber(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits.startsWith('375')) return '+375 '
  let result = '+375 ('
  if (digits.length > 3) result += digits.substring(3, 5)
  if (digits.length >= 5) result += ') '
  if (digits.length > 5) result += digits.substring(5, 8)
  if (digits.length >= 8) result += '-'
  if (digits.length > 8) result += digits.substring(8, 10)
  if (digits.length >= 10) result += '-'
  if (digits.length > 10) result += digits.substring(10, 12)
  return result
}

export function unformatPhone(value: string): string {
  return value.replace(/\D/g, '')
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
