import { PrismaClient, User } from '@prisma/client';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default';

// User API
export async function GET(req: NextRequest) {
	try {
		const authHeader = req.headers.get('authorization');
		if (!authHeader) {
			return NextResponse.json({ success: false, message: 'Authorization header missing' }, { status: 401 });
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			return NextResponse.json({ success: false, message: 'Token missing' }, { status: 401 });
		}

		// Verify the JWT
		let decoded: any;
		try {
			decoded = jwt.verify(token, JWT_SECRET);
		} catch (err) {
			return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
		}

		// Find the user based on the decoded userId
		const userId = decoded.userId;
		const user: User | null = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!user) {
			return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				dob: user.dob.toISOString().split('T')[0]
			}
		});
	} catch (error) {
		console.error('Error fetching user:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}
