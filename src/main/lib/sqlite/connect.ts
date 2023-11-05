import Database from './Database'

export default function connect<T>(
  fileName: string,
  successCallback?: () => void
) {
  const db = new Database<T>(fileName, (err) => {
    if (err) {
      throw err
    }

    if (successCallback) successCallback()
  })

  return db
}
