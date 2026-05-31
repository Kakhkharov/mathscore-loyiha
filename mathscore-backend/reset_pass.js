const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUser() {
  const email = 'musurmonqahharov747@gmail.com'; // User's email
  
  const plainPassword = '12345678';
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(plainPassword, salt);
  
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: 'Musurmon Qahharov',
          email: email,
          password: hashedPassword,
          role: 'student',
          course: 'SAT Mathematics Intensive',
          status: 'Online',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&auto=format&fit=crop'
        }
      });
      console.log('User created successfully:', email);
    } else {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      console.log('User password updated:', email);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}
createUser().finally(() => prisma.$disconnect());
