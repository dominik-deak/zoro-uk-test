import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { GET as userHandler } from '../../app/api/user/route';
import { mockAppHandler } from '../helpers/mockAppHandler';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default';

describe('User API', () => {
	const TIMEOUT = 10000; // Increase timeout for async operations

	it(
		'should return a 401 status if authorization header is missing',
		async () => {
			const appHandler = mockAppHandler(userHandler);
			const response = await request(appHandler).get('/');
			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Authorization header missing');
		},
		TIMEOUT
	);

	it(
		'should return a 401 status if token is missing',
		async () => {
			const appHandler = mockAppHandler(userHandler);
			const response = await request(appHandler).get('/').set('Authorization', 'Bearer ');
			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Token missing');
		},
		TIMEOUT
	);

	it(
		'should return a 401 status for an invalid token',
		async () => {
			const appHandler = mockAppHandler(userHandler);
			const invalidToken = jwt.sign({ userId: 1 }, 'wrong-secret');
			const response = await request(appHandler).get('/').set('Authorization', `Bearer ${invalidToken}`);
			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Invalid or expired token');
		},
		TIMEOUT
	);

	it(
		'should return a 404 status if user is not found',
		async () => {
			const appHandler = mockAppHandler(userHandler);
			// Non-existent userId
			const validToken = jwt.sign({ userId: 9999 }, JWT_SECRET, {
				expiresIn: '1h'
			});
			const response = await request(appHandler).get('/').set('Authorization', `Bearer ${validToken}`);
			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('User not found');
		},
		TIMEOUT
	);

	it(
		'should return a 200 status and user data for a valid token',
		async () => {
			const appHandler = mockAppHandler(userHandler);
			const validToken = jwt.sign({ userId: 1 }, JWT_SECRET, {
				expiresIn: '1h'
			});
			const response = await request(appHandler).get('/').set('Authorization', `Bearer ${validToken}`);
			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.user).toBeDefined();
			expect(response.body.user.id).toBe(1);
		},
		TIMEOUT
	);
});
