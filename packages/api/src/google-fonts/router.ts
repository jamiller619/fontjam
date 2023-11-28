import { createReadStream } from 'node:fs'
import process from 'node:process'
import { Router } from 'express'

const JSON_FILE = process.env.GOOGLE_FONTS_JSON_SAVE_PATH
const router = Router()

router.get('/list', async (_, res) => {
  const stream = createReadStream(JSON_FILE)

  stream.pipe(res)
})

export default router
