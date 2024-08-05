import request from 'supertest';
import { POST as loginHandler } from '../../app/api/login/route';
import { mockAppHandler } from '../helpers/mockAppHandler';

describe('Login API', () => {
	const TIMEOUT = 10000; // Increase timeout for async operations

	it(
		'should return a 400 status if username or password is missing',
		async () => {
			const appHandler = mockAppHandler(loginHandler);
			const response = await request(appHandler).post('/').send({ username: '', password: '' });
			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Username and password are required');
		},
		TIMEOUT
	);

	it(
		'should return a 401 status for invalid username',
		async () => {
			const appHandler = mockAppHandler(loginHandler);
			const response = await request(appHandler).post('/').send({ username: 'invalidUser', password: 'password' });
			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Invalid username');
		},
		TIMEOUT
	);

	it(
		'should return a 401 status for invalid password',
		async () => {
			const appHandler = mockAppHandler(loginHandler);
			const response = await request(appHandler).post('/').send({ username: 'username', password: 'wrongPassword' });
			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Invalid password');
		},
		TIMEOUT
	);

	it(
		'should return a 200 status and token for valid credentials',
		async () => {
			const appHandler = mockAppHandler(loginHandler);
			const response = await request(appHandler).post('/').send({ username: 'username', password: 'password' });
			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.token).toBeDefined();
			expect(response.body.user).toBeDefined();
		},
		TIMEOUT
	);
});
