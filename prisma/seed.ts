const PrismaClient = require('@prisma/client').PrismaClient;
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
	// Clear existing users in the database
	await prisma.user.deleteMany();
	console.log('Users cleared');

	// Reset auto-increment for SQLite
	await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name='User'`;
	console.log('Auto-increment value reset');

	// Hash the password for security
	const hashedPassword = await bcrypt.hash('password', 10);

	// Add a new user to the database
	const user = await prisma.user.create({
		data: {
			username: 'username',
			password: hashedPassword,
			firstName: 'John',
			lastName: 'Doe',
			dob: new Date('1970-01-01'),
			email: 'johndoe@example.com'
		}
	});

	console.log('User added:', user);
}

// Run the seed script
main()
	.catch(e => {
		console.error('Error seeding the database:', e);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
