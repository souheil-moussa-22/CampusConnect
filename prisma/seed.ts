import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  await prisma.notification.deleteMany(); await prisma.report.deleteMany(); await prisma.review.deleteMany(); await prisma.studySession.deleteMany(); await prisma.helpProposal.deleteMany(); await prisma.helpRequest.deleteMany(); await prisma.availability.deleteMany(); await prisma.studentProfile.deleteMany(); await prisma.user.deleteMany(); await prisma.skill.deleteMany(); await prisma.subject.deleteMany();
  const password = await bcrypt.hash('Password123!', 12);
  const react = await prisma.skill.create({data:{name:'React'}}); const sql = await prisma.skill.create({data:{name:'SQL'}}); const algorithms = await prisma.skill.create({data:{name:'Algorithms'}});
  const computer = await prisma.subject.create({data:{name:'Computer Science'}}); const math = await prisma.subject.create({data:{name:'Mathematics'}});
  const admin = await prisma.user.create({data:{name:'Campus Admin',email:'admin@campus.test',passwordHash:password,role:'ADMIN'}});
  const lena = await prisma.user.create({data:{name:'Lena Martin',email:'lena@campus.test',passwordHash:password,profile:{create:{specialty:'Computer Science',level:'L3',biography:'Frontend enthusiast helping peers build accessible interfaces.',averageRating:4.8,reviewCount:12,skills:{connect:[{id:react.id},{id:algorithms.id}]},availabilities:{create:[{day:'Monday',startTime:'14:00',endTime:'18:00'},{day:'Wednesday',startTime:'09:00',endTime:'12:00'}]}}}}});
  const noah = await prisma.user.create({data:{name:'Noah Bernard',email:'noah@campus.test',passwordHash:password,profile:{create:{specialty:'Mathematics',level:'M1',biography:'Data and mathematics tutor.',averageRating:4.5,reviewCount:8,skills:{connect:[{id:sql.id},{id:algorithms.id}]},availabilities:{create:[{day:'Tuesday',startTime:'10:00',endTime:'16:00'}]}}}}});
  const maya = await prisma.user.create({data:{name:'Maya Dubois',email:'maya@campus.test',passwordHash:password,profile:{create:{specialty:'Computer Science',level:'L2',biography:'Learning web development and databases.',averageRating:4.2,reviewCount:5,skills:{connect:[{id:react.id},{id:sql.id}]},availabilities:{create:[{day:'Monday',startTime:'14:00',endTime:'18:00'}]}}}}});
  await prisma.helpRequest.createMany({data:[
    {title:'React hooks practice',description:'Looking for help understanding state, effects and custom hooks before my practical exam.',subjectId:computer.id,level:'L2',availability:'Monday afternoon',authorId:maya.id,status:'OPEN'},
    {title:'Prepare SQL joins',description:'I need a partner to review inner joins, aggregation and query optimization.',subjectId:computer.id,level:'L3',availability:'Wednesday morning',authorId:lena.id,status:'OPEN'},
    {title:'Graph algorithms revision',description:'Study group for shortest paths and dynamic programming.',subjectId:computer.id,level:'M1',availability:'Tuesday',authorId:noah.id,status:'OPEN'}
  ]});
  const [r1,r2] = await prisma.helpRequest.findMany({take:2,orderBy:{createdAt:'asc'}});
  await prisma.helpProposal.create({data:{requestId:r1.id,studentId:lena.id,message:'I can help you build several hooks step by step.'}});
  await prisma.helpProposal.create({data:{requestId:r2.id,studentId:noah.id,message:'I can review joins and indexes with practical examples.'}});
  await prisma.notification.createMany({data:[
    {recipientId:maya.id,type:'PROPOSAL_RECEIVED',message:'Lena submitted a proposal on your React hooks request.'},
    {recipientId:lena.id,type:'PROPOSAL_RECEIVED',message:'Noah submitted a proposal on your SQL joins request.'}
  ]});
  console.log('Seeded demo accounts: lena@campus.test, noah@campus.test, maya@campus.test, admin@campus.test (Password123!)');
}
main().finally(()=>prisma.$disconnect());
