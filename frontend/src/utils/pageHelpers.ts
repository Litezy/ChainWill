export const formatCompact = (value: string | number) => {
  const num = typeof value === "string" ? Number(value) : value

  if (num >= 1_000_000_000)
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B"

  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"

  if (num >= 1_000)
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K"

  return num.toString()
}