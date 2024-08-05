import { NextRequest, NextResponse } from 'next/server';

// Just to simulate a logout
export async function POST(_req: NextRequest) {
	try {
		return NextResponse.json({ success: true, message: 'Logout successful' }, { status: 200 });
	} catch (error) {
		console.error('Error during logout:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}
