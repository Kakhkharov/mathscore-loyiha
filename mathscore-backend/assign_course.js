const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const student = await prisma.user.findFirst({ where: { email: 'binafsha1212@gmail.com' } });
    const course = await prisma.course.findFirst();

    if (student && course) {
        await prisma.userCourse.upsert({
            where: {
                userId_courseId: { userId: student.id, courseId: course.id }
            },
            update: {},
            create: {
                userId: student.id,
                courseId: course.id
            }
        });
        console.log(`Assigned course ${course.title} to student ${student.name}`);
    } else {
        console.log('Student or course not found');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
