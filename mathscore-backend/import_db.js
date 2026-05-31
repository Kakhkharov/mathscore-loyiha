const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Reading db.json...');
  const dbData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'db.json'), 'utf8'));

  console.log('Clearing database tables...');
  await prisma.submission.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.test.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.course.deleteMany({});

  console.log('Importing courses and lessons...');
  for (const c of dbData.courses) {
    console.log(`Inserting course: ${c.title} (${c.id})`);
    const course = await prisma.course.create({
      data: {
        id: c.id,
        title: c.title,
        category: c.category,
        instructor: c.instructor,
        price: String(c.price),
        image: c.image || '',
        description: c.description || ''
      }
    });

    if (c.lessons && c.lessons.length > 0) {
      for (const l of c.lessons) {
        console.log(`  Inserting lesson: ${l.title}`);
        await prisma.lesson.create({
          data: {
            title: l.title,
            duration: String(l.duration),
            videoUrl: l.videoUrl || '',
            courseId: course.id
          }
        });
      }
    }
  }

  console.log('Importing tests and questions...');
  for (const t of dbData.tests) {
    console.log(`Inserting test: ${t.title} (${t.id})`);
    
    // Find course by name to link it if possible
    let courseId = null;
    if (t.course) {
      const course = await prisma.course.findFirst({
        where: {
          title: {
            contains: t.course
          }
        }
      });
      if (course) {
        courseId = course.id;
      }
    }

    const test = await prisma.test.create({
      data: {
        id: t.id,
        title: t.title,
        category: t.category || 'General',
        difficulty: t.difficulty || 'Medium',
        questionCount: Number(t.questionCount || (t.questions ? t.questions.length : 0)),
        duration: Number(t.duration || 60),
        status: t.status || 'Published',
        courseId: courseId
      }
    });

    if (t.questions && t.questions.length > 0) {
      for (const q of t.questions) {
        console.log(`  Inserting question: ${q.text.substring(0, 30)}...`);
        await prisma.question.create({
          data: {
            type: q.type || 'single',
            text: q.text,
            options: JSON.stringify(q.options || []),
            correctAnswer: Number(q.correctAnswer || 0),
            score: Number(q.score || 1),
            explanation: q.explanation || '',
            testId: test.id
          }
        });
      }
    }
  }

  console.log('Database import completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
