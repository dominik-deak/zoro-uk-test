module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom', // Use jsdom for frontend tests
	testMatch: ['**/tests/frontend/**/*.test.[tj]s?(x)'], // Match only frontend tests
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'\\.(css|less|sass|scss)$': 'identity-obj-proxy',
		'\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/mocks/fileMock.js'
	},
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest']
	},
	transformIgnorePatterns: ['node_modules/(?!(axios)/)'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
