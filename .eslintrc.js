module.exports = {
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: './tsconfig.json',
		ecmaVersion: 2020,
		ecmaFeatures: {
			jsx: true,
		},
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	env: {
		es2020: true,
	},
	plugins: ['@typescript-eslint', 'react'],
	reportUnusedDisableDirectives: true,
	rules: {
		'no-var': 'error',
		'no-console': [
			'warn',
			{
				allow: ['warn', 'error', 'time', 'timeEnd'],
			},
		],
		'no-duplicate-imports': 'warn',
		eqeqeq: 'error',
		// Enabled rules
		'@typescript-eslint/no-shadow': 'warn',
		'prefer-const': 'warn',
		'@typescript-eslint/no-useless-constructor': 'warn',
		'@typescript-eslint/no-floating-promises': 'error',
		'@typescript-eslint/prefer-nullish-coalescing': 'warn',
		'@typescript-eslint/prefer-optional-chain': 'warn',
		// Disabled rules
		'no-shadow': 'off',
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		// Disabling the below rules improves performance
		// https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/FAQ.md#eslint-plugin-import
		'import/named': 'off',
		'import/namespace': 'off',
		'import/default': 'off',
		'import/no-named-as-default-member': 'off',
	},
	settings: {
		react: {
			createClass: 'createReactClass', // Regex for Component Factory to use,
			// default to "createReactClass"
			pragma: 'React', // Pragma to use, default to "React"
			fragment: 'Fragment', // Fragment to use (may be a property of <pragma>), default to "Fragment"
			version: 'detect', // React version. "detect" automatically picks the version you have installed.
			// You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
			// default to latest and warns if missing
			// It will default to "detect" in the future
			flowVersion: '0.53', // Flow version
		},
		propWrapperFunctions: [
			// The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn't set, any propTypes wrapped in a function will be skipped.
			'forbidExtraProps',
			{ property: 'freeze', object: 'Object' },
			{ property: 'myFavoriteWrapper' },
			// for rules that check exact prop wrappers
			{ property: 'forbidExtraProps', exact: true },
		],
		componentWrapperFunctions: [
			// The name of any function used to wrap components, e.g. Mobx `observer` function. If this isn't set, components wrapped by these functions will be skipped.
			'observer', // `property`
			{ property: 'styled' }, // `object` is optional
			{ property: 'observer', object: 'Mobx' },
			{ property: 'observer', object: '<pragma>' }, // sets `object` to whatever value `settings.react.pragma` is set to
		],
		formComponents: [
			// Components used as alternatives to <form> for forms, eg. <Form endpoint={ url } />
			'CustomForm',
			{ name: 'Form', formAttribute: 'endpoint' },
		],
		linkComponents: [
			// Components used as alternatives to <a> for linking, eg. <Link to={ url } />
			'Hyperlink',
			{ name: 'Link', linkAttribute: 'to' },
		],
	},
}
