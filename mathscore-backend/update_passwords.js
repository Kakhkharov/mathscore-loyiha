const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const adminHash = await bcrypt.hash('admin123', 10);
    const studentHash = await bcrypt.hash('student123', 10);

    await prisma.user.update({
        where: { email: 'admin@mathscore.uz' },
        data: { password: adminHash }
    });

    await prisma.user.update({
        where: { email: 'binafsha1212@gmail.com' },
        data: { password: studentHash }
    });
    console.log("Passwords updated");
}

main().catch(console.error).finally(() => prisma.$disconnect());
