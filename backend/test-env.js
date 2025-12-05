import dotenv from 'dotenv';
dotenv.config();

console.log('Environment variables loaded:');
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');
console.log('Is Neon?:', process.env.DATABASE_URL?.includes('neon.tech') || false);
