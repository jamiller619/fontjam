import path from 'node:path'
// import { fileURLToPath } from 'node:url'
import { app } from 'electron'
import type { Config } from '@shared/config'
import Application from '~/core/Application'
import * as ModuleLoader from '~/core/ModuleLoader'

async function initializeApp() {
  // Create application default configuration
  const defaultConfig: Config = {
    'backup.enabled': false,
    'privacy.analytics.enabled': false,
    'privacy.crashReporting.enabled': true,
    'scan.auto.enabled': true,
    'sync.enabled': false,
    'window.height': 600,
    'window.width': 800,
    'window.x': 200,
    'window.y': 200,
    'db.path': path.join(app.getPath('userData'), 'databases', 'fontjam.db'),
    'userdata.path': app.getPath('userData'),
    'app.env': app.isPackaged ? 'production' : 'development',
    'worker.path': path.join(app.getPath('userData'), 'workers'),
  }

  // Create application instance
  const application = new Application(defaultConfig)

  // Load and register modules
  const modules = await ModuleLoader.loadModules(
    ['user', 'library', 'font'],
    application.getModuleContext(),
  )

  for (const module of modules) {
    application.registerModule(module)
  }

  return application
}

/**
 * Setup IPC handlers for renderer communication
 */
// function setupIpcHandlers() {
//   if (!application) return

//   // Font module handlers
//   const fontApi = application.getModuleAPI<FontModuleAPI>('font')

//   ipcMain.handle('font:get', async (_, id: string) => {
//     return await fontApi.getFont(id)
//   })

//   ipcMain.handle('font:getAll', async (_, libraryId?: string) => {
//     return await fontApi.getFonts(libraryId)
//   })

//   ipcMain.handle('font:add', async (_, fontPath: string, libraryId: string) => {
//     return await fontApi.addFont(fontPath, libraryId)
//   })

//   ipcMain.handle('font:remove', async (_, id: string) => {
//     return await fontApi.removeFont(id)
//   })

//   ipcMain.handle('font:activate', async (_, id: string) => {
//     return await fontApi.activateFont(id)
//   })

//   ipcMain.handle('font:deactivate', async (_, id: string) => {
//     return await fontApi.deactivateFont(id)
//   })

//   ipcMain.handle('font:search', async (_, query: string) => {
//     return await fontApi.searchFonts(query)
//   })

//   // Library module handlers
//   const libraryAPI = application.getModuleAPI<LibraryModuleAPI>('library')

//   ipcMain.handle('library:get', async (_, id: string) => {
//     return libraryAPI['library.get'](id)
//   })

//   ipcMain.handle('library:getAll', async () => {
//     return await libraryAPI.getLibraries()
//   })

//   ipcMain.handle('library:create', async (_, data: any) => {
//     return await libraryAPI.createLibrary(data)
//   })

//   ipcMain.handle('library:update', async (_, id: string, data: any) => {
//     return await libraryAPI.updateLibrary(id, data)
//   })

//   ipcMain.handle('library:delete', async (_, id: string) => {
//     return await libraryAPI.deleteLibrary(id)
//   })

//   // User module handlers
//   const userApi = application.getModuleAPI<UserModuleApi>('user')

//   ipcMain.handle('user:getPreferences', async () => {
//     return await userApi.getPreferences()
//   })

//   ipcMain.handle('user:updatePreferences', async (_, preferences: any) => {
//     return await userApi.updatePreferences(preferences)
//   })

//   ipcMain.handle('user:getSettings', async () => {
//     return await userApi.getSettings()
//   })

//   // Listen to module events and send to renderer
//   const eventBus = application.getEventBus()

//   eventBus.on('font:added', (payload) => {
//     mainWindow?.webContents.send('font:added', payload)
//   })

//   eventBus.on('font:removed', (payload) => {
//     mainWindow?.webContents.send('font:removed', payload)
//   })

//   eventBus.on('library:created', (payload) => {
//     mainWindow?.webContents.send('library:created', payload)
//   })

//   eventBus.on('library:deleted', (payload) => {
//     mainWindow?.webContents.send('library:deleted', payload)
//   })
// }

// App lifecycle

app.on('ready', async () => {
  try {
    let application: Application | null = await initializeApp()
    // const win: BrowserWindow | null = createWindow()

    // Initialize application (this will initialize all modules)
    await application.initialize()

    application.log.info(
      'Application initialized with modules:',
      application.getModuleNames(),
    )

    app.on('activate', () => {
      if (application?.window == null) {
        application?.window
      }

      // if (win === null) {
      //   createWindow()
      // }
    })

    app.on('before-quit', async (event) => {
      if (application) {
        event.preventDefault()
        await application.shutdown()
        application = null
        app.exit(0)
      }
    })
  } catch (error) {
    console.error('Failed to initialize application:', error)
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  app.quit()
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
})
