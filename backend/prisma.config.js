const { defineConfig } = require("@prisma/config");

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
});
