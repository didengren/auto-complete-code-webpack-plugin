module.exports = {
  root: true,
  env: {
    node: true
  },
  globals: {
    "window": false,
    "document": false,
    "navigator": false
  },
  parser: "babel-eslint",
  parserOptions: {
    "ecmaVersion": 2019,
    "sourceType": "module"
  },
  extends: [
    "@webpack-contrib/eslint-config-webpack",
    // "eslint:recommended", // or plugins: - import     rules: - import/no-extraneous-dependencies
    "prettier"
  ],
  plugins: ["import", "prettier"],
  rules: {
    "no-void": 0,
    "no-bitwise": 0,
    "no-new": 0,
    "no-shadow": 0,
    "camelcase": [0, {
      "properties": "always"
    }],
    "func-names": 0,
    "no-console": 0,
    "no-plusplus": 0,
    "arrow-parens": 2,
    "comma-dangle": 0,
    "default-case": 0,
    "prefer-template": 0,
    "consistent-return": 0,
    "no-param-reassign": 0,
    "no-nested-ternary": 0,
    "operator-linebreak": 0,
    "object-curly-newline": 0,
    "no-underscore-dangle": 0,
    "no-unused-expressions": 0,
    "no-restricted-globals": 0,
    "function-paren-newline": 0,
    "class-methods-use-this": 0,
    "implicit-arrow-linebreak": 0,
    "space-before-function-paren": 0,
    "max-len": ["error", {
      "code": 150
    }],
    "no-extra-boolean-cast": 0,
    "prefer-destructuring": 0,
    "import/no-extraneous-dependencies": 0,
    "import/prefer-default-export": 0,
    "prettier/prettier": "error"
  }
}
