module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node', // Use node for API tests
	testMatch: ['**/tests/backend/**/*.test.[tj]s?(x)'], // Match only backend tests
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/app/$1'
	},
	transform: {
		'^.+\\.tsx?$': 'ts-jest'
	}
};
