import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';
import LoginPage from '../../app/login/page';

// Mock axios and next/router
jest.mock('axios');
jest.mock('next/navigation', () => ({
	useRouter: jest.fn()
}));

describe('Login Page', () => {
	const mockRouter = {
		push: jest.fn(),
		replace: jest.fn()
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue(mockRouter);

		// Suppress console logs for aesthetic tests
		jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterAll(() => {
		// Restore console logs after all tests
		(console.log as jest.Mock).mockRestore();
		(console.error as jest.Mock).mockRestore();
	});

	it('renders the login form', () => {
		render(<LoginPage />);

		// Check that the form fields are rendered
		expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
	});

	it('allows the user to type in the username and password fields', () => {
		render(<LoginPage />);

		// Simulate user typing into the username and password fields
		fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
		fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpassword' } });

		expect(screen.getByLabelText(/username/i)).toHaveValue('testuser');
		expect(screen.getByLabelText(/password/i)).toHaveValue('testpassword');
	});

	it('displays an error message on failed login', async () => {
		(axios.post as jest.Mock).mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });

		render(<LoginPage />);

		// Simulate user typing and submitting the form
		fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
		fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
		fireEvent.click(screen.getByRole('button', { name: /login/i }));

		// Wait for the error message to appear
		expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
	});

	it('redirects to the user page on successful login', async () => {
		(axios.post as jest.Mock).mockResolvedValueOnce({
			data: { success: true, token: 'fake-jwt-token' }
		});

		render(<LoginPage />);

		// Simulate user typing and submitting the form
		fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
		fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpassword' } });
		fireEvent.click(screen.getByRole('button', { name: /login/i }));

		// Verify navigation occurred
		await waitFor(() => {
			expect(mockRouter.replace).toHaveBeenCalledWith('/');
		});
	});
});
