import { IncomingMessage, ServerResponse } from 'http';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Converts IncomingHttpHeaders to Headers.
 */
function headersToHeadersInit(incomingHeaders: IncomingMessage['headers']): Headers {
	const headers = new Headers();
	for (const [key, value] of Object.entries(incomingHeaders)) {
		if (Array.isArray(value)) {
			for (const v of value) {
				headers.append(key, v);
			}
		} else if (value) {
			headers.set(key, value);
		}
	}
	return headers;
}

/**
 * Mock HTTP handler for app router.
 */
export function mockAppHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
	return async (req: IncomingMessage, res: ServerResponse) => {
		const chunks: Buffer[] = [];

		req.on('data', chunk => {
			chunks.push(chunk);
		});

		req.on('end', async () => {
			const body = Buffer.concat(chunks);
			const headers = headersToHeadersInit(req.headers);

			// Create a NextRequest using Buffer for the body
			try {
				const request = new NextRequest('http://localhost:3000/api/logout', {
					method: req.method,
					headers: headers,
					body: body.length > 0 ? body : undefined
				});

				const response = await handler(request);

				res.statusCode = response.status;
				res.statusMessage = response.statusText;
				response.headers.forEach((value, key) => {
					res.setHeader(key, value);
				});

				const responseBody = await response.text();
				res.end(responseBody);
			} catch (error) {
				// Handle errors thrown by the handler
				console.error('Error handling request:', error);
				const errorResponse = JSON.stringify({ success: false, message: 'Internal server error' });
				res.setHeader('Content-Type', 'application/json');
				res.statusCode = 500;
				res.end(errorResponse);
			}
		});
	};
}
