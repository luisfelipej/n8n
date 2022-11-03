/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	extends: ['@n8n_io/eslint-config/node'],
	rules: {
		// TODO: Remove this
		'import/order': 'off',
		'@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true }],
	},
};
