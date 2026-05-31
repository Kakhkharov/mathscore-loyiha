const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const courses = await prisma.course.findMany();
  if (courses.length > 0) {
    console.log('Trying to delete course:', courses[0].id);
    try {
      await prisma.course.delete({ where: { id: courses[0].id } });
      console.log('Deleted successfully!');
    } catch (e) {
      console.log('Error deleting:', e.message);
    }
  } else {
    console.log('No courses found.');
  }
}
run();
