import Module from './Module'
import { ModuleContext } from './types'

// export type ModuleDefaultExport<E extends EventMap = EventMap> = (
//   name: string,
//   ctx: ModuleContext<E>,
// ) => Module<E>
interface ModuleDefaultExport {
  new (name: string, ctx: ModuleContext): Module
}

export async function loadModule(
  name: string,
  ctx: ModuleContext,
): Promise<Module> {
  try {
    // Dynamic import of module
    const modulePath = `./modules/${name}/index.js`
    const moduleExport = await import(modulePath)

    // Get default export (should be a function that returns a module instance)
    const ModuleClass = moduleExport.default as ModuleDefaultExport

    if (!ModuleClass || typeof ModuleClass !== 'function') {
      throw new Error(`Module ${name} does not have a valid default export`)
    }

    return new ModuleClass(name, ctx)
  } catch (error) {
    throw new Error(
      `Failed to load module ${name}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}

export async function loadModules(
  moduleNames: string[],
  ctx: ModuleContext,
): Promise<Module[]> {
  return Promise.all(moduleNames.map((name) => loadModule(name, ctx)))
}

// export async function autoLoadModules(modulesDir: string): Promise<Module[]> {
//   const { readdir } = await import('node:fs/promises')

//   try {
//     const entries = await readdir(modulesDir, { withFileTypes: true })
//     const moduleNames = entries
//       .filter((entry) => entry.isDirectory())
//       .map((entry) => entry.name)

//     return await loadModules(moduleNames)
//   } catch (error) {
//     throw new Error(
//       `Failed to auto-load modules: ${
//         error instanceof Error ? error.message : 'Unknown error'
//       }`,
//     )
//   }
// }
