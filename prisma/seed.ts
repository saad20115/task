import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // إنشاء المستخدم الأساسي
  await prisma.employee.upsert({
    where: { phone: '0580623205' },
    update: {},
    create: {
      name: 'سعد محمد',
      phone: '0580623205',
      role: 'admin',
      department: 'تقنية المعلومات',
    },
  });

  console.log('✅ تم إعداد قاعدة البيانات بنجاح');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
