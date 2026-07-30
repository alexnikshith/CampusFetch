import { prisma } from '../config/prisma';

async function updateOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${orders.length} orders in database.`);

  for (let i = 0; i < orders.length; i++) {
    const newOrderNumber = `avv${String(i + 1).padStart(3, '0')}`;
    await prisma.order.update({
      where: { id: orders[i].id },
      data: { orderNumber: newOrderNumber },
    });
    console.log(`Order ${orders[i].id} updated to ${newOrderNumber}`);
  }

  console.log('All orders successfully updated to avv001 onwards format!');
}

updateOrders()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
