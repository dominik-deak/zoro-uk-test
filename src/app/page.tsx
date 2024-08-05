'use client';

import { User } from '@prisma/client';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Loading from '../components/Loading';

interface JwtPayload {
	userId: number;
	exp: number;
}

/**
 * User page displaying the user's data.
 */
function UserPage() {
	const [user, setUser] = useState<Omit<User, 'password'> | null>(null); // remove password for security
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const router = useRouter();

	useEffect(() => {
		async function fetchUserData() {
			const token = localStorage.getItem('token');

			if (!token) {
				setError('Unauthorized access. Please log in.');
				router.replace('/login');
				return;
			}

			try {
				// Decode the JWT and check its expiration
				const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
				const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

				if (decoded.exp < currentTime) {
					setError('Session expired. Please log in again.');
					localStorage.removeItem('token');
					router.replace('/login');
					return;
				}

				const response = await axios.get('/api/user', {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				if (response.data.success) {
					setUser(response.data.user);
				} else {
					setError(response.data.message);
					router.replace('/login');
				}
			} catch (err) {
				console.error('Error fetching user data:', err);
				setError('An error occurred while fetching user data.');
				router.replace('/login');
			} finally {
				setLoading(false);
			}
		}

		fetchUserData();
	}, [router]);

	// Logout function using the mock API
	async function handleLogout() {
		try {
			const response = await axios.post('/api/logout');
			if (response.data.success) {
				localStorage.removeItem('token');
				router.replace('/login');
			} else {
				setError(response.data.message);
			}
		} catch (err) {
			console.error('Error during logout:', err);
			setError('An error occurred while logging out.');
		}
	}

	if (loading) {
		return <Loading />;
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-100'>
				<div className='max-w-md w-full bg-white rounded-lg shadow-md p-8'>
					<p className='text-red-500 text-center'>{error}</p>
					<button onClick={() => router.replace('/login')} className='btn btn-primary mt-4 w-full'>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	if (!user) {
		router.replace('/login');
		return null;
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='max-w-md w-full bg-white rounded-lg shadow-md p-8'>
				<h2 className='text-2xl font-bold mb-6 text-center'>User Profile</h2>
				<div className='flex justify-center mb-6'>
					<div className='avatar'>
						<div className='w-24 h-24 rounded-full overflow-hidden relative'>
							<Image
								src='https://www.pngarts.com/files/3/Avatar-PNG-Download-Image.png'
								alt='User Avatar'
								width={200}
								height={200}
								priority // This ensures that the image is loaded as a priority, improving LCP
							/>
						</div>
					</div>
				</div>
				<div className='space-y-4'>
					<div>
						<span className='font-bold'>First Name: </span>
						{user.firstName}
					</div>
					<div>
						<span className='font-bold'>Last Name: </span>
						{user.lastName}
					</div>
					<div>
						<span className='font-bold'>Email: </span>
						{user.email}
					</div>
					<div>
						<span className='font-bold'>Date of Birth: </span>
						{user.dob.toString()}
					</div>
					<button onClick={handleLogout} className='btn btn-error mt-6 w-full'>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
}

export default UserPage;
