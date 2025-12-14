import type { IncomingMessage, ServerResponse } from 'node:http';
export declare function handleMcpRequest(pathname: string, req: IncomingMessage, res: ServerResponse): Promise<boolean>;
