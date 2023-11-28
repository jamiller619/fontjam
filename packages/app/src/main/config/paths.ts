import envPaths from 'env-paths'
import { name } from '@root/package.json'

export default envPaths(name, {
  suffix: '',
})
