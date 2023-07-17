import { agent as testAgent } from 'supertest';
import { AbstractServer } from '@/AbstractServer';
import { ActiveWorkflowRunner } from '@/ActiveWorkflowRunner';
import { ExternalHooks } from '@/ExternalHooks';
import { InternalHooks } from '@/InternalHooks';
import { TestWebhooks } from '@/TestWebhooks';
import { WaitingWebhooks } from '@/WaitingWebhooks';
import { mockInstance } from './shared/utils';
import { mock } from 'jest-mock-extended';
import type { IResponseCallbackData } from '@/Interfaces';
import config from '@/config';

describe('WebhookServer', () => {
	mockInstance(ExternalHooks);
	mockInstance(InternalHooks);
	const activeWorkflowRunner = mockInstance(ActiveWorkflowRunner);
	const testWebhooks = mockInstance(TestWebhooks);
	const waitingWebhooks = mockInstance(WaitingWebhooks);

	class TestServer extends AbstractServer {
		testWebhooksEnabled = true;
	}

	const server = new TestServer();
	const agent = testAgent(server.app);

	beforeAll(async () => {
		await server.start();
	});

	const corsOrigin = 'https://example.com';
	const tests = [
		['webhook', activeWorkflowRunner],
		['webhookTest', testWebhooks],
		// TODO: enable webhookWaiting after CORS support is added
		// ['webhookWaiting', waitingWebhooks],
	] as const;

	for (const [key, manager] of tests) {
		it(`should handle ${key} preflight requests`, async () => {
			const pathPrefix = config.getEnv(`endpoints.${key}`);
			manager.getWebhookMethods.mockResolvedValueOnce(['GET']);

			const response = await agent.options(`/${pathPrefix}/abcd`).set('origin', corsOrigin);
			expect(response.statusCode).toEqual(204);
			expect(response.body).toEqual({});
			expect(response.headers['access-control-allow-origin']).toEqual(corsOrigin);
			expect(response.headers['access-control-allow-methods']).toEqual('OPTIONS, GET');
		});

		it(`should handle ${key} requests`, async () => {
			const pathPrefix = config.getEnv(`endpoints.${key}`);
			manager.getWebhookMethods.mockResolvedValueOnce(['GET']);
			manager.executeWebhook.mockResolvedValueOnce(mockResponse({ test: true }));

			const response = await agent.get(`/${pathPrefix}/abcd`).set('origin', corsOrigin);
			expect(response.statusCode).toEqual(200);
			expect(response.body).toEqual({ test: true });
			expect(response.headers['access-control-allow-origin']).toEqual(corsOrigin);
		});
	}

	const mockResponse = (data = {}, status = 200) => {
		const response = mock<IResponseCallbackData>();
		response.responseCode = status;
		response.data = data;
		return response;
	};
});
