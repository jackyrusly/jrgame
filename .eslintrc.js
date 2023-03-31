module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  extends: ['eslint-config-prettier', 'plugin:prettier/recommended'],
  rules: {
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [
          {
            pattern: 'phaser',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['phaser'],
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'sort-imports': [
      'error',
      { ignoreMemberSort: false, ignoreDeclarationSort: true },
    ],
  },
  settings: {
    'import/internal-regex':
      '^@constants|@objects|^@models|@scenes|^@utilities',
  },
};
