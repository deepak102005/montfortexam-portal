/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('superadmin123', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@college.edu' },
    update: {},
    create: {
      email: 'superadmin@college.edu',
      username: 'superadmin',
      passwordHash: superAdminPassword,
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email} (password: superadmin123)`);

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@college.edu' },
    update: {},
    create: {
      email: 'admin@college.edu',
      username: 'admin',
      passwordHash: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email} (password: admin123)`);

  // Create sample MPC Admin
  const teacherPassword = await bcrypt.hash('teacher123', 12);
  const mpcTeacher = await prisma.user.upsert({
    where: { email: 'mpc.teacher@college.edu' },
    update: {},
    create: {
      email: 'mpc.teacher@college.edu',
      username: 'mpcteacher',
      passwordHash: teacherPassword,
      name: 'Dr. Ramesh Kumar',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`✅ MPC Admin created: ${mpcTeacher.email} (password: teacher123)`);

  // Create sample BIPC Admin
  const bipcTeacher = await prisma.user.upsert({
    where: { email: 'bipc.teacher@college.edu' },
    update: {},
    create: {
      email: 'bipc.teacher@college.edu',
      username: 'bipcteacher',
      passwordHash: teacherPassword,
      name: 'Dr. Priya Sharma',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`✅ BIPC Admin created: ${bipcTeacher.email} (password: teacher123)`);

  // Create sample MPC Students
  const studentPassword = await bcrypt.hash('student123', 12);
  const mpcStudents = [
    { name: 'Arjun Reddy', email: 'arjun@student.college.edu', username: 'arjun', rollNumber: 'MPC001', grade: '11' },
    { name: 'Sneha Patel', email: 'sneha@student.college.edu', username: 'sneha', rollNumber: 'MPC002', grade: '11' },
    { name: 'Ravi Teja', email: 'ravi@student.college.edu', username: 'ravi', rollNumber: 'MPC003', grade: '12' },
  ];

  for (const s of mpcStudents) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        username: s.username,
        passwordHash: studentPassword,
        name: s.name,
        role: 'STUDENT',
        isActive: true,
        studentProfile: {
          create: {
            stream: 'MPC',
            rollNumber: s.rollNumber,
            grade: s.grade,
            phone: '9876543210',
          },
        },
      },
    });
    console.log(`✅ MPC Student created: ${s.email} (password: student123)`);
  }

  // Create sample BIPC Students
  const bipcStudents = [
    { name: 'Ananya Gupta', email: 'ananya@student.college.edu', username: 'ananya', rollNumber: 'BIPC001', grade: '11' },
    { name: 'Karthik Rao', email: 'karthik@student.college.edu', username: 'karthik', rollNumber: 'BIPC002', grade: '11' },
  ];

  for (const s of bipcStudents) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        username: s.username,
        passwordHash: studentPassword,
        name: s.name,
        role: 'STUDENT',
        isActive: true,
        studentProfile: {
          create: {
            stream: 'BIPC',
            rollNumber: s.rollNumber,
            grade: s.grade,
            phone: '9876543212',
          },
        },
      },
    });
    console.log(`✅ BIPC Student created: ${s.email} (password: student123)`);
  }

  // Create a sample test
  const sampleTest = await prisma.test.upsert({
    where: { id: 'sample-test-1' },
    update: {},
    create: {
      id: 'sample-test-1',
      title: 'JEE Main Mock Test - Week 1',
      grade: '11',
      stream: 'MPC',
      duration: 60,
      totalMarks: 120,
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      status: 'PUBLISHED',
      negativeMarking: true,
      negativeMarks: 1,
      createdById: mpcTeacher.id,
    },
  });

  // Add sample questions
  const sampleQuestions = [
    { text: 'A ball is thrown vertically upward with velocity 20 m/s. What is the maximum height reached?', options: ['10 m', '20 m', '30 m', '40 m'], correct: 1, marks: 4 },
    { text: 'The SI unit of force is:', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correct: 1, marks: 4 },
    { text: 'Which of the following is a vector quantity?', options: ['Speed', 'Mass', 'Temperature', 'Velocity'], correct: 3, marks: 4 },
  ];

  for (let i = 0; i < sampleQuestions.length; i++) {
    const q = sampleQuestions[i];
    await prisma.question.upsert({
      where: { id: `sample-q-${i + 1}` },
      update: {},
      create: {
        id: `sample-q-${i + 1}`,
        testId: sampleTest.id,
        questionNumber: i + 1,
        text: q.text,
        options: q.options,
        correctOption: q.correct,
        marks: q.marks,
        negativeMarks: 1,
      },
    });
  }
  console.log(`✅ Sample test created with ${sampleQuestions.length} questions`);

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Login credentials:');
  console.log('  Super Admin: superadmin / superadmin123');
  console.log('  Admin:   admin / admin123');
  console.log('  Admin (MPC): mpcteacher / teacher123');
  console.log('  Admin (BIPC): bipcteacher / teacher123');
  console.log('  Student: arjun / student123');
  console.log('  Student: ananya / student123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
