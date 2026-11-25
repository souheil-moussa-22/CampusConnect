import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const noOuterLayerImports = {
  patterns: [{
    group: [
      '**/infrastructure/**',
      '@/infrastructure/**',
      '@prisma/client',
      'bcryptjs',
      'next',
      'next/**',
      'react',
      'react-dom',
    ],
    message: 'Domain and application code must not depend on presentation or infrastructure frameworks.',
  }],
};

export default defineConfig([
  ...nextVitals,
  {
    files: [
      'src/application/**/*.{ts,tsx}',
      'src/domain/**/*.{ts,tsx}',
      'src/modules/**/application/**/*.{ts,tsx}',
      'src/modules/**/domain/**/*.{ts,tsx}',
    ],
    rules: { 'no-restricted-imports': ['error', noOuterLayerImports] },
  },
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/presentation/auth.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/infrastructure/**', '@/modules/**/infrastructure/**', '@prisma/client', 'bcryptjs'],
          message: 'Presentation must use application services instead of infrastructure adapters.',
        }],
      }],
    },
  },
  {
    files: ['src/infrastructure/**/*.{ts,tsx}', 'src/modules/**/infrastructure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/presentation/**', '**/app/**', '**/components/**'],
          message: 'Infrastructure must not depend on presentation.',
        }],
      }],
    },
  },
  globalIgnores(['.next/**', 'node_modules/**']),
]);
