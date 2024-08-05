import React from 'react';

/**
 * Loading component with spinner
 */
export default function Loading() {
	return (
		<div className='fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 z-50'>
			<div className='text-center'>
				<span className='loading loading-spinner loading-lg text-blue-600'></span>
				<p className='text-blue-600 mt-4 font-semibold'>Loading...</p>
			</div>
		</div>
	);
}
