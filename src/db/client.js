// src/db/client.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
if (!globalForPrisma.db) {
  globalForPrisma.db = new PrismaClient();
}

export const db = globalForPrisma.db;
