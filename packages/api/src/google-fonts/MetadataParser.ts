import fs from 'node:fs/promises'

export type MetadataFont = {
  style: string
  weight: number
  filename: string
  post_script_name: string
  full_name: string
}

type Axis = {
  min: number
  max: number
}

type Axes = Record<string, Axis>

export type Metadata = {
  name: string
  path: string
  designer: string
  license: string
  date_added: string
  fonts: MetadataFont[]
  subsets: string[]
  copyright: string
  // Category and Classifications appear to duplicate values
  category: string
  classifications?: string[]
  // Only available on variable fonts
  axes?: Axes
}

const MetadataKeys: (keyof Metadata)[] = [
  'name',
  'designer',
  'license',
  'category',
  'date_added',
  'fonts',
  'subsets',
  'classifications',
  'copyright',
]

const MetadataFontKeys = [
  'style',
  'weight',
  'filename',
  'post_script_name',
  'full_name',
] as const

function trim(parts: string[]) {
  return parts.map((p) => p.trim()).filter(String)
}

function parseStringValue(val: string) {
  return val.replaceAll('"', '')
}

function parseNumberValue(val: string) {
  const num = Number(val)

  return Number.isNaN(num) ? undefined : num
}

function parseFont(lines: string[]) {
  const resp: Record<string, string | number> = {}
  let line
  let copyright

  while ((line = lines.shift()) !== '}') {
    if (!line) continue

    const [key, value] = trim(line.split(/:(.*)/s))

    if (!key || !value) continue

    if (key === 'copyright') {
      copyright = parseStringValue(value)
    }

    // the only number value appears to be "weight"
    if (key === 'weight') {
      const weight = parseNumberValue(value)

      if (weight != null) {
        resp.weight = weight
      }
    }

    if (MetadataFontKeys.includes(key as keyof MetadataFont)) {
      resp[key] = value
    }
  }

  return [copyright, resp] as const
}

function parseAxes(lines: string[]) {
  const resp: Axis = {
    min: 0,
    max: 0,
  }

  let line: string | undefined
  let axisType: string | undefined

  while ((line = lines.shift()) !== '}') {
    if (!line) continue

    const [key, value] = trim(line.split(/:(.*)/s))

    if (!key || !value) continue

    if (key === 'tag') {
      axisType = value.replaceAll('"', '')
    } else if (key === 'min_value') {
      resp.min = Number(value)
    } else if (key === 'max_value') {
      resp.max = Number(value)
    }
  }

  return [axisType, resp] as const
}

export async function parse(filePath: string) {
  const file = await fs.readFile(filePath, 'utf-8')
  const lines = file.split('\r\n')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resp: Record<string, any> = {}

  while (lines.length) {
    const line = lines.shift()

    if (!line) continue

    // Split the string only on the first occurance of a colon.
    const [key, value] = trim(line.split(/:(.*)/s))

    if (line === 'fonts {') {
      resp.fonts ??= []

      const [copyright, font] = parseFont(lines)

      if (copyright) {
        resp.copyright = copyright
      }

      resp.fonts.push(font)
    } else if (line === 'axes {') {
      const [key, axis] = parseAxes(lines)

      if (key != null) {
        resp.axes ??= {}
        resp.axes[key] = axis
      }
    } else if (MetadataKeys.includes(key as keyof Metadata)) {
      if (key === 'subsets' || key === 'classifications') {
        resp[key] ??= []
        resp[key].push(parseStringValue(value))
      } else {
        resp[key] = parseStringValue(value)
      }
    }
  }

  return resp as Omit<Metadata, 'path'>
}
