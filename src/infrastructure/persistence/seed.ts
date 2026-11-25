import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
async function main() {
  await prisma.notification.deleteMany(); await prisma.report.deleteMany(); await prisma.review.deleteMany(); await prisma.studySession.deleteMany(); await prisma.helpProposal.deleteMany(); await prisma.helpRequest.deleteMany(); await prisma.availability.deleteMany(); await prisma.studentProfile.deleteMany(); await prisma.user.deleteMany(); await prisma.skill.deleteMany(); await prisma.subject.deleteMany();
  const password = await bcrypt.hash('Password123!', 12);
  const react = await prisma.skill.create({data:{name:'React'}}); const sql = await prisma.skill.create({data:{name:'SQL'}}); const algorithms = await prisma.skill.create({data:{name:'Algorithms'}});
  const computer = await prisma.subject.create({data:{name:'Computer Science'}}); const math = await prisma.subject.create({data:{name:'Mathematics'}});
  const admin = await prisma.user.create({data:{name:'Campus Admin',email:'admin@campus.test',passwordHash:password,role:'ADMIN'}});
  const lena = await prisma.user.create({data:{name:'Lena Martin',email:'lena@campus.test',passwordHash:password,profile:{create:{specialty:'Computer Science',level:'L3',biography:'Frontend enthusiast helping peers build accessible interfaces.',averageRating:4.8,reviewCount:12,skills:{connect:[{id:react.id},{id:algorithms.id}]},availabilities:{create:[{day:'Monday',startTime:'14:00',endTime:'18:00'},{day:'Wednesday',startTime:'09:00',endTime:'12:00'}]}}}}});
  await prisma.helpRequest.createMany({data:[
    {title:'Prepare SQL joins',description:'I need a partner to review inner joins, aggregation and query optimization.',subjectId:computer.id,level:'L3',availability:'Wednesday morning',authorId:lena.id,status:'OPEN'},
  ]});
  const [r1] = await prisma.helpRequest.findMany({take:2,orderBy:{createdAt:'asc'}});
  await prisma.helpProposal.create({data:{requestId:r1.id,studentId:lena.id,message:'I can help you build several hooks step by step.'}});
  await prisma.notification.createMany({data:[
    {recipientId:lena.id,type:'PROPOSAL_RECEIVED',message:'Lena submitted a proposal on your SQL joins request.'}
  ]});
  console.log('Seeded demo accounts: lena@campus.test, admin@campus.test (Password123!)');
}
main().finally(()=>prisma.$disconnect());
