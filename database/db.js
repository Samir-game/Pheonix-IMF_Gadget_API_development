const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()

// connecting Postgres database (cloud-based: neon)
async function connectionDB(){
  try {
    await prisma.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Failed to connect to database:',error.message)
    process.exit(1)
  }
}

process.on('SIGINT',async()=>{
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM',async()=>{
  await prisma.$disconnect()
  process.exit(0)
})

module.exports = {
  connectionDB,
  prisma
}
