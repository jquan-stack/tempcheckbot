import { prisma } from './db';

export type Medication = 'Panadol' | 'Ibuprofen';

export async function createRecord(userId: number, childName: string, temperature: number, medication: Medication, dosage: number) {
  const user = await prisma.user.upsert({
    where: { id: BigInt(userId) },
    update: {},
    create: { id: BigInt(userId) },
  });

  let child = await prisma.child.findFirst({
    where: { userId: BigInt(userId), name: childName },
  });

  if (!child) {
    child = await prisma.child.create({
      data: {
        name: childName,
        userId: BigInt(userId),
      },
    });
  }

  await prisma.record.create({
    data: {
      userId: BigInt(userId),
      childId: child.id,
      timestamp: Date.now(),
      temperature,
      medication,
      dosage,
    },
  });
}

export async function getRecords(userId: number, childName: string, range: '6h' | '12h' | '1d' | '3d' | '7d') {
  const msMap = {
    '6h': 6 * 3600 * 1000,
    '12h': 12 * 3600 * 1000,
    '1d': 24 * 3600 * 1000,
    '3d': 3 * 24 * 3600 * 1000,
    '7d': 7 * 24 * 3600 * 1000,
  };
  const since = Date.now() - msMap[range];

  return prisma.record.findMany({
    where: {
      userId: BigInt(userId),
      child: {
        name: childName,
      },
      timestamp: {
        gte: since,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
}

export async function getNextFeed(userId: number, childName: string) {
  const records = await prisma.record.findMany({
    where: {
      userId: BigInt(userId),
      child: {
        name: childName,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  const lastPanadol = records.find(r => r.medication === 'Panadol');
  const lastIbuprofen = records.find(r => r.medication === 'Ibuprofen');

  let nextPanadol:any = lastPanadol ? lastPanadol.timestamp + BigInt(4 * 3600 * 1000) : BigInt(0);
  let nextIbuprofen:any = lastIbuprofen ? lastIbuprofen.timestamp + BigInt(6 * 3600 * 1000) : BigInt(0);

  if (Math.abs(Number(nextPanadol) - Number(nextIbuprofen)) < 3600 * 1000) {
    if (nextPanadol < nextIbuprofen) nextIbuprofen += BigInt(3600 * 1000);
    else nextPanadol += BigInt(3600 * 1000);
  }

  let panadolDate = new Date(nextPanadol);
  return nextPanadol < nextIbuprofen
    ? { medication: 'Panadol', time: new Date(nextPanadol).toLocaleString() }
    : { medication: 'Ibuprofen', time: new Date(nextIbuprofen).toLocaleString() };
}