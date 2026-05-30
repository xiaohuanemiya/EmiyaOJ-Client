const MIN_WIDTH = 10
const MAX_WIDTH = 100
const MIN_HEIGHT = 10
const MAX_HEIGHT = 10000

const getHashNumber = (url: string, key: string, min: number, max: number) => {
  const hashIndex = url.indexOf('#')
  if (hashIndex === -1) return null

  const hash = url.slice(hashIndex + 1)
  const part = hash.split('&').find((item) => item.startsWith(`${key}=`))
  if (!part) return null

  const value = Number(part.slice(key.length + 1))
  return Number.isInteger(value) && value >= min && value <= max ? value : null
}

export const applyProblemImageSizes = (container: ParentNode) => {
  container.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    const src = image.getAttribute('src') || ''
    const width = getHashNumber(src, 'emiyaoj-width', MIN_WIDTH, MAX_WIDTH)
    const height = getHashNumber(src, 'emiyaoj-height', MIN_HEIGHT, MAX_HEIGHT)

    if (width !== null) image.style.width = `${width}%`
    if (height !== null) image.style.height = `${height}px`
  })
}
