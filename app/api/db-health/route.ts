import { db } from '@/database/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const result = await db.execute('SELECT 1');
        return NextResponse.json({ status: 'connected', timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json(
            { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}