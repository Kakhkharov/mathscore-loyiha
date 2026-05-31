const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { JWT_SECRET } = require('./security');

async function test() {
  const email = 'musurmonqahharov747@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log("User not found");
    return;
  }
  
  const oldPassword = '12345678';
  console.log("Old password valid?", bcrypt.compareSync(oldPassword, user.password));
  
  // Simulate forgot-password
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
  
  // Simulate reset-password with new password
  const newPassword = 'newPassword999';
  const salt = bcrypt.genSaltSync(10);
  const newHashed = bcrypt.hashSync(newPassword, salt);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { password: newHashed }
  });
  
  const userAfter = await prisma.user.findUnique({ where: { email } });
  console.log("Old password valid after reset?", bcrypt.compareSync(oldPassword, userAfter.password));
  console.log("New password valid after reset?", bcrypt.compareSync(newPassword, userAfter.password));
}

test().finally(() => prisma.$disconnect());
