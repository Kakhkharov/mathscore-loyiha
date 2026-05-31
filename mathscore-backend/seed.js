const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const count = await prisma.course.count();
  if (count === 0) {
    console.log('Seeding courses...');
    await prisma.course.create({
      data: {
        title: "SAT Mathematics Intensive",
        category: "SAT Prep",
        instructor: "Malika Opa",
        price: "1200000",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop",
        description: "Intensive 3-month SAT Math preparation course.",
      }
    });
    await prisma.course.create({
      data: {
        title: "Advanced Calculus Masterclass",
        category: "Math Masterclass",
        instructor: "Malika Opa",
        price: "900000",
        image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop",
        description: "Master limits, derivatives, and integrals.",
      }
    });
    console.log('Seeded successfully!');
  } else {
    console.log('Courses already exist.');
  }
}

seed().catch(e => console.error(e)).finally(() => prisma.$disconnect());
