import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default';

interface LoginRequestBody {
	username: string;
	password: string;
}

// Login API
export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const { username, password } = (await req.json()) as LoginRequestBody;

		if (!username || !password) {
			return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
		}

		// Find the user by username
		const user: User | null = await prisma.user.findUnique({
			where: {
				username: username
			}
		});

		// Check if user exists
		if (!user) {
			return NextResponse.json({ success: false, message: 'Invalid username' }, { status: 401 });
		}

		// Check if password matches
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
		}

		// Generate JWT
		const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

		// Return token and user info
		return NextResponse.json(
			{
				success: true,
				message: 'Login successful',
				token: token,
				user: {
					id: user.id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					dob: user.dob.toISOString().split('T')[0]
				}
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error during login:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}
