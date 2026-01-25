import playwright from 'eslint-plugin-playwright';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import js from '@eslint/js';
import globals from 'globals'; // <--- 1. Import globals

export default [
  {
    ignores: ['node_modules/', 'playwright-report/', 'test-results/'],
  },

  js.configs.recommended,

  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        ...globals.node, // <--- 2. Add Node.js global variables (like process)
        ...globals.browser, // Optional: adds browser globals like 'window'
        ...globals.process,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      playwright: playwright,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...playwright.configs['flat/recommended'].rules,
      'no-console': ['warn', { allow: ['warn', 'error', 'log', 'debug'] }],
      '@typescript-eslint/no-unused-vars': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'no-undef': 'error', // Now this will only error if it's truly unknown
    },
  },
];
