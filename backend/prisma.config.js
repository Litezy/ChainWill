const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

module.exports = {
  schema: "prisma/schema.prisma",
  ...(url ? { datasource: { url } } : {}),
};
