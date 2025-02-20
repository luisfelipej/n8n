/** @type {import('jest').Config} */
module.exports = {
	...require('../../jest.config'),
	testEnvironmentOptions: {
		url: 'http://localhost/',
	},
	globalSetup: '<rootDir>/test/setup.ts',
	globalTeardown: '<rootDir>/test/teardown.ts',
	setupFilesAfterEnv: ['<rootDir>/test/setup-mocks.ts', '<rootDir>/test/extend-expect.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@db/(.*)$': '<rootDir>/src/databases/$1',
	},
	coveragePathIgnorePatterns: ['/src/databases/migrations/'],
	testTimeout: 10_000,
};
