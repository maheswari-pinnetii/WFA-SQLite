import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      'dist/**',
      'node_modules/**',
      'tests/**',
      'playwright/**',
      'scratch/**',
      'scripts/archive/**',
      '*.cjs',
      '**/*.cjs'
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      'prefer-const': 'off',
      'preserve-caught-error': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-useless-catch': 'off',
      'no-useless-assignment': 'off',
      'no-empty': 'off'
    }
  }
);
