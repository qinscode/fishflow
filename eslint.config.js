// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      'android/*',
      'ios/*',
      '.expo/*',
      '.github/*',
    ],
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      // Prettier 集成
      // 'prettier/prettier': 'error',

      // JavaScript/TypeScript 基础规则
      // 'no-console': 'warn', // 警告使用console
      'no-debugger': 'error', // 禁止使用debugger
      'no-var': 'error', // 禁止使用var
      'prefer-const': 'error', // 优先使用const
      eqeqeq: ['error', 'always'], // 强制使用===
      curly: ['error', 'all'], // 强制使用大括号

      // React 相关规则
      'react/jsx-uses-react': 'off', // React 17+ 不需要import React
      'react/react-in-jsx-scope': 'off', // React 17+ 不需要import React
      'react/prop-types': 'off', // 使用TypeScript时关闭prop-types检查
      'react/display-name': 'warn', // 组件需要displayName
      'react/jsx-key': 'error', // 列表项需要key
      'react/jsx-no-duplicate-props': 'error', // 禁止重复的props
      'react/jsx-pascal-case': 'error', // 组件名使用PascalCase

      // React Hooks 规则
      'react-hooks/rules-of-hooks': 'error', // Hooks规则
      'react-hooks/exhaustive-deps': 'warn', // useEffect依赖项检查

      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': 'off', // 关闭未使用变量警告

      // Import/Export 规则
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'error', // 禁止重复导入

      // 关闭与Prettier冲突的规则
      indent: 'off',
      quotes: 'off',
      semi: 'off',
      'comma-dangle': 'off',
      'object-curly-spacing': 'off',
      'array-bracket-spacing': 'off',
      'jsx-quotes': 'off',
      'no-multiple-empty-lines': 'off',
    },
  },
])
