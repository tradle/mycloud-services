export const leftPad = (value: string | number, length: number) => {
  value = String(value)
  if (value.length < length) {
    return '0'.repeat(length - value.length) + value
  }

  return value
}

export const toDateParts = (timestamp: number) => {
  const date = new Date(timestamp)
  const day = date.getUTCDate()
  const month = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()
  return {
    day: leftPad(day, 2),
    month: leftPad(month, 2),
    year: String(year),
    hour: leftPad(date.getUTCHours(), 2),
    minute: leftPad(date.getUTCMinutes(), 2),
    second: leftPad(date.getUTCSeconds(), 2)
  }
}
