import process from 'node:process'
import express from 'express'
import googleFontsRouter from '~/google-fonts/router'

const app = express()

app.use('/google-fonts', googleFontsRouter)

app.listen(process.env.PORT)
