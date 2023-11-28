declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_FONTS_GIT_PATH: string
      GOOGLE_FONTS_JSON_SAVE_PATH: string
      PORT: string
    }
  }
}

export {}
