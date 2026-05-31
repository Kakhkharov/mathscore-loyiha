const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.landingSettings.create({
    data: {
      heroTitle: "SAT Matematikani zamonaviy metodlar yordamida, ingliz tilida tez va samarali o'rganing",
      heroSubtitle: "Jahon standartlariga mos ta'lim. Yuqori ball oling va nufuzli xorijiy universitetlarga grant yutish imkoniyatini qo'lga kiriting.",
      contactPhone: "+998 99 824 46 18",
      contactAddress: "Toshkent shahri, Sergeli tumani",
      telegramLink: "https://t.me/math_teacher_m"
    }
  });

  const results = [
    { score: 'SAT 1520', name: 'Azizbek K.', color: 'text-primary' },
    { score: 'SAT 1480', name: 'Malika O.', color: 'text-tertiary' },
    { score: 'A-Level A*', name: 'Sardor T.', color: 'text-secondary' },
    { score: 'SAT 1550', name: 'Durdona S.', color: 'text-primary' }
  ];

  for (const r of results) {
    await prisma.result.create({ data: r });
  }

  const pricing = [
    { title: 'SAT Matematika', description: 'Noldan boshlab yuqori darajagacha intensiv tayyorgarlik. Ingliz tilida masalalar yechish.', price: '600,000', type: 'primary' },
    { title: 'A-Level Math', description: 'Kembrij dasturi asosida chuqurlashtirilgan matematika. Pure Math va Mechanics.', price: '700,000', type: 'tertiary' },
    { title: 'Matematika Foundation', description: 'Asosiy matematik bilimlarni mustahkamlash va ingliz tilidagi terminlarga moslashish.', price: '500,000', type: 'secondary' }
  ];

  for (const p of pricing) {
    await prisma.pricing.create({ data: p });
  }

  console.log("Database seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
