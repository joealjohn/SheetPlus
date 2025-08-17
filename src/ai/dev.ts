'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/enhance-data-interpretation.ts';
import '@/ai/flows/auto-correct-ocr.ts';
import '@/ai/flows/extract-text-from-image.ts';
