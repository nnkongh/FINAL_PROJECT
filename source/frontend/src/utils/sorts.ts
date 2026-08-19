export const mapOrder = <T>(originalArray: T[], orderArray: string[], key: keyof T): T[] => {
  if (!originalArray || !orderArray || !key) return []

  const clonedArray = [...originalArray]
  const orderedArray = clonedArray.sort((a, b) => {
    return orderArray.indexOf(a[key] as unknown as string) - orderArray.indexOf(b[key] as unknown as string)
  })

  return orderedArray
}
