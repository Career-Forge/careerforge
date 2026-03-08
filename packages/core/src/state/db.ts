import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../drizzle/schema';

// Connection string should come from environment variables
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/careerforge';

const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
