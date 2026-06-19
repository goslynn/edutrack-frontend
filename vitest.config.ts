import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Reusa el vite.config (alias `@`, plugin React) y le añade la capa de test.
// Cobertura acotada a la **capa de lógica** (api, lib, hooks, context y los
// helpers `*.ts` de la capa de componentes): coherente con la regla dura del
// proyecto de que los componentes visuales y las páginas-container no llevan
// lógica de negocio (ver CLAUDE.md → "Separación visual / interacción").
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'text-summary', 'html'],
        include: [
          'src/api/**/*.ts',
          'src/lib/**/*.ts',
          'src/hooks/**/*.ts',
          'src/context/**/*.tsx',
          'src/components/**/*.ts',
          'src/components/dashboard/nav-config.tsx',
        ],
        exclude: [
          'src/**/*.d.ts',
          'src/**/*.{test,spec}.{ts,tsx}',
          // Barrels / re-exports puros (sin código ejecutable en runtime).
          'src/api/http-transport.ts',
          'src/api/index.ts',
        ],
      },
    },
  }),
)
