const request = require('supertest');
const app = require('../src/index');

describe('Health & Routing', () => {

    test('GET /health returns 200 and status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.timestamp).toBeDefined();
    });

    test('GET /nonexistent returns 404 with JSON message', async () => {
        const res = await request(app).get('/nonexistent');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain('Route not found');
    });

    test('CORS headers include origin for allowed client', async () => {
        const res = await request(app)
            .get('/health')
            .set('Origin', 'http://localhost:5173');
        expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    test('GET /ready reports not ready when databases are disconnected', async () => {
        const res = await request(app).get('/ready');
        expect(res.statusCode).toBe(503);
        expect(res.body.status).toBe('not_ready');
        expect(res.body.mongo).toBe(false);
        expect(res.body.redis).toBe(false);
    });

    test('Security headers are set via helmet', async () => {
        const res = await request(app).get('/health');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
        expect(res.headers['x-frame-options']).toBeDefined();
    });

});
