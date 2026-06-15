const log = (...args: unknown[]) => process.stderr.write(`[etsy-toolkit] ${args.join(' ')}\n`);
const error = (...args: unknown[]) => process.stderr.write(`[etsy-toolkit:error] ${args.join(' ')}\n`);

export const logger = { log, error };
