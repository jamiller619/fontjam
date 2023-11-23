import { Box, Select } from '@radix-ui/themes'
import { Fragment, HTMLAttributes, useState } from 'react'

type Tables = Record<string, opentype.Table>

type TableProps = HTMLAttributes<HTMLDivElement> & {
  data?: Tables
}

function sortKeys(a: string, b: string) {
  if (a === 'name' || a < b) {
    return -1
  }

  if (a > b) {
    return 1
  }

  return 0
}

function sortObject(obj?: Tables) {
  if (!obj) return

  const keys = Object.keys(obj).sort(sortKeys)
  const resp = {} as Tables

  for (const key of keys) {
    resp[key] = obj[key]
  }

  return resp
}

export default function Tables({ data, ...props }: TableProps) {
  const sorted = sortObject(data)
  const [activeTab, setActiveTab] = useState('name')

  return (
    <Fragment>
      <Select.Root value={activeTab} onValueChange={setActiveTab}>
        <Select.Trigger />
        <Select.Content>
          {Object.keys(sorted ?? {}).map((key) => (
            <Select.Item key={key} value={key}>
              {key}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <Box {...props}>
        {activeTab && sorted && (
          <pre>{JSON.stringify(sorted[activeTab], null, 2)}</pre>
        )}
      </Box>
    </Fragment>
  )
}
