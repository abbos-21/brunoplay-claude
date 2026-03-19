// Test setup
// In a real environment, this would set up a test database
// For now, it ensures the test environment is configured

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/brunoplay_test';
process.env.BOT_TOKEN = 'test-bot-token-12345678901234567890';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long-1234';
process.env.ADMIN_JWT_SECRET = 'test-admin-jwt-secret-at-least-32-chars-1234';
process.env.WEB_APP_URL = 'https://test.example.com';
process.env.BOT_USERNAME = 'TestBot';
process.env.HOT_WALLET_MNEMONIC = 'test mnemonic phrase for testing only';
process.env.TON_API_ENDPOINT = 'https://testnet.toncenter.com/api/v2';
process.env.TON_API_TOKEN = 'test-ton-api-token';
