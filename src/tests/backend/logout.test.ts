import request from 'supertest';
import { POST as logoutHandler } from '../../app/api/logout/route';
import { mockAppHandler } from '../helpers/mockAppHandler';

describe('Logout API', () => {
	const TIMEOUT = 10000; // Increase timeout for async operations

	it(
		'should return a 200 status and message on successful logout',
		async () => {
			const appHandler = mockAppHandler(logoutHandler);
			const response = await request(appHandler).post('/');
			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe('Logout successful');
		},
		TIMEOUT
	);

	it(
		'should handle server errors gracefully',
		async () => {
			// Spy on console.error to suppress error output during testing
			jest.spyOn(global.console, 'error').mockImplementation(() => {});

			// Mock the handler to throw an error for testing
			const errorHandler = async (_req: any) => {
				throw new Error('Test Error');
			};

			// Use the errorHandler to simulate a server error
			const appHandler = mockAppHandler(errorHandler);
			const response = await request(appHandler).post('/');
			expect(response.status).toBe(500);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Internal server error');
		},
		TIMEOUT
	);
});
