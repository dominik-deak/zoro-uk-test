import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';
import UserPage from '../../app/page';

// Mock axios and next/router
jest.mock('axios');
jest.mock('next/navigation', () => ({
	useRouter: jest.fn()
}));
jest.mock('jwt-decode', () => ({
	jwtDecode: jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })
}));

describe('User Page', () => {
	const mockRouter = {
		push: jest.fn(),
		replace: jest.fn()
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
		jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterAll(() => {
		(console.log as jest.Mock).mockRestore();
		(console.error as jest.Mock).mockRestore();
	});

	it('renders user profile with data', async () => {
		const mockToken = 'valid-token';
		localStorage.setItem('token', mockToken);

		(axios.get as jest.Mock).mockResolvedValueOnce({
			data: {
				success: true,
				user: {
					id: 1,
					firstName: 'John',
					lastName: 'Doe',
					email: 'johndoe@example.com',
					dob: '1970-01-01'
				}
			}
		});

		render(<UserPage />);

		// Wait for loading to finish
		await waitFor(() => {
			expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
		});

		// Now check for user data
		expect(screen.getByText(/John/)).toBeInTheDocument();
		expect(screen.getByText(/Doe/)).toBeInTheDocument();
		expect(screen.getByText(/johndoe@example.com/)).toBeInTheDocument();
		expect(screen.getByText(/1970-01-01/)).toBeInTheDocument();
	});

	it('handles missing token by redirecting to login', () => {
		localStorage.removeItem('token');

		render(<UserPage />);

		// Verify redirect to login
		expect(mockRouter.replace).toHaveBeenCalledWith('/login');
	});

	it('handles expired token by redirecting to login', async () => {
		// Mock an expired token
		const mockToken = 'expired-token';
		localStorage.setItem('token', mockToken);

		// Mock axios get to throw a token error
		(axios.get as jest.Mock).mockRejectedValueOnce({
			response: {
				data: { message: 'Invalid or expired token' }
			}
		});

		render(<UserPage />);

		await waitFor(() => {
			// Verify redirect to login
			expect(mockRouter.replace).toHaveBeenCalledWith('/login');
		});
	});

	it('logs out and redirects to login on logout button click', async () => {
		const mockToken = 'valid-token';
		localStorage.setItem('token', mockToken);

		(axios.get as jest.Mock).mockResolvedValueOnce({
			data: {
				success: true,
				user: {
					id: 1,
					firstName: 'John',
					lastName: 'Doe',
					email: 'johndoe@example.com',
					dob: '1970-01-01'
				}
			}
		});

		(axios.post as jest.Mock).mockResolvedValueOnce({
			data: { success: true }
		});

		render(<UserPage />);

		// Wait for loading to finish
		await waitFor(() => {
			expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
		});

		// Click the logout button
		fireEvent.click(screen.getByRole('button', { name: /logout/i }));

		// Verify logout action
		await waitFor(() => {
			expect(mockRouter.replace).toHaveBeenCalledWith('/login');
		});
		expect(localStorage.getItem('token')).toBeNull();
	});
});
