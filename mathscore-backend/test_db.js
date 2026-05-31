const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const users = await p.user.findMany();
  const courses = await p.course.findMany({ include: { lessons: true } });
  const tests = await p.test.findMany();
  console.log('Users count:', users.length);
  console.log('Courses count:', courses.length);
  console.log('Tests count:', tests.length);
  if (courses.length > 0) {
    console.log('Courses details:', JSON.stringify(courses, null, 2));
  }
}
main().catch(console.error).finally(() => p.$disconnect());
