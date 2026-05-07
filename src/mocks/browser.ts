import { setupWorker } from 'msw/browser';
import { restHandlers } from './handlers/rest';

export const worker = setupWorker(...restHandlers);
