'use client';

import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

/**
 * Login page with form for username and password
 */
export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault(); // Prevent default form submission

		setIsLoading(true);
		console.log('Submitting form: setting isLoading to true');

		try {
			const response = await axios.post('/api/login', { username, password });

			if (response.data.success === true) {
				localStorage.setItem('token', response.data.token);
				router.replace('/');
			} else {
				setError(response.data.message);
				setUsername('');
				setPassword('');
			}
		} catch (err) {
			console.error('Login error:', err);

			const axiosError = err as AxiosError<{ message: string }>;
			const errorMessage = axiosError.response?.data?.message || 'An error occurred during login. Please try again.';

			setError(errorMessage);
			setUsername('');
			setPassword('');
		} finally {
			console.log('Resetting isLoading to false');
			setIsLoading(false);
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='max-w-md w-full bg-white rounded-lg shadow-md p-8'>
				<h2 className='text-2xl font-bold mb-6 text-center'>Login</h2>

				<form onSubmit={handleLogin} className='space-y-4'>
					{error && <div className='text-red-500 text-center'>{error}</div>}

					<div className='form-control'>
						<label className='label' htmlFor='username'>
							<span className='label-text'>Username</span>
						</label>
						<input
							id='username'
							type='text'
							placeholder='Enter your username'
							value={username}
							onChange={e => setUsername(e.target.value)}
							className='input input-bordered w-full'
							required
							disabled={isLoading}
						/>
					</div>

					<div className='form-control'>
						<label className='label' htmlFor='password'>
							<span className='label-text'>Password</span>
						</label>
						<input
							id='password'
							type='password'
							placeholder='Enter your password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							className='input input-bordered w-full'
							required
							disabled={isLoading}
						/>
					</div>

					<button type='submit' className='btn btn-primary w-full' disabled={isLoading}>
						{isLoading ? 'Loading...' : 'Login'}
					</button>
				</form>
			</div>
		</div>
	);
}
