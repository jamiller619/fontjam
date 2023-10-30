import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('useandom2619834075pxbfghjklqvwyzrict', 8)

export function createId() {
  return `${nanoid()}.${nanoid()}`
}
