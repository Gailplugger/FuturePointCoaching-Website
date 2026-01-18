/**
 * @jest-environment node
 */

const { handler: loginHandler } = require('../admin-login');
const { handler: listNotesHandler } = require('../list-notes');
const { handler: uploadPdfHandler } = require('../upload-pdf');
const { handler: addAdminHandler } = require('../add-admin');
const { handler: removeAdminHandler } = require('../remove-admin');

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.REPO_OWNER = 'test-owner';
process.env.REPO_NAME = 'test-repo';

describe('Netlify Functions', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('admin-login', () => {
    it('should reject requests without token', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({}),
      };

      const result = await loginHandler(event, {});

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toContain('required');
    });

    it('should handle OPTIONS for CORS', async () => {
      const event = {
        httpMethod: 'OPTIONS',
      };

      const result = await loginHandler(event, {});

      expect(result.statusCode).toBe(204);
    });

    it('should reject invalid HTTP methods', async () => {
      const event = {
        httpMethod: 'GET',
      };

      const result = await loginHandler(event, {});

      expect(result.statusCode).toBe(405);
    });

    it('should validate token with GitHub API', async () => {
      // Mock GitHub user API
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({ token: 'invalid-token' }),
      };

      const result = await loginHandler(event, {});

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body).error).toContain('Invalid');
    });
  });

  describe('list-notes', () => {
    it('should handle GET requests', async () => {
      // Mock GitHub API for empty directory
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {},
      };

      const result = await listNotesHandler(event, {});

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.files).toEqual([]);
    });

    it('should reject non-GET requests', async () => {
      const event = {
        httpMethod: 'POST',
      };

      const result = await listNotesHandler(event, {});

      expect(result.statusCode).toBe(405);
    });
  });

  describe('upload-pdf', () => {
    it('should reject requests without authentication', async () => {
      const event = {
        httpMethod: 'POST',
        headers: {},
        body: JSON.stringify({
          fileBase64: 'dGVzdA==',
          fileName: 'test.pdf',
          classNo: '10',
          stream: 'cbse',
          subject: 'math',
        }),
      };

      const result = await uploadPdfHandler(event, {});

      expect(result.statusCode).toBe(401);
    });

    it('should validate required fields', async () => {
      // Create a mock JWT cookie
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { sessionId: 'test', username: 'test', isSuperAdmin: false },
        process.env.JWT_SECRET
      );

      const event = {
        httpMethod: 'POST',
        headers: {
          cookie: `fp_admin=${token}`,
        },
        body: JSON.stringify({
          fileBase64: 'dGVzdA==',
          fileName: 'test.txt', // Invalid: not a PDF
          classNo: '13', // Invalid: must be 10, 11, or 12
          stream: 'invalid',
          subject: '',
        }),
      };

      const result = await uploadPdfHandler(event, {});

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errors).toBeDefined();
      expect(body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('add-admin', () => {
    it('should reject non-super-admin users', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { sessionId: 'test', username: 'test', isSuperAdmin: false },
        process.env.JWT_SECRET
      );

      const event = {
        httpMethod: 'POST',
        headers: {
          cookie: `fp_admin=${token}`,
        },
        body: JSON.stringify({ username: 'newadmin' }),
      };

      const result = await addAdminHandler(event, {});

      expect(result.statusCode).toBe(403);
    });

    it('should require username', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { sessionId: 'test', username: 'superadmin', isSuperAdmin: true },
        process.env.JWT_SECRET
      );

      const event = {
        httpMethod: 'POST',
        headers: {
          cookie: `fp_admin=${token}`,
        },
        body: JSON.stringify({}),
      };

      const result = await addAdminHandler(event, {});

      expect(result.statusCode).toBe(400);
    });
  });

  describe('remove-admin', () => {
    it('should reject non-super-admin users', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { sessionId: 'test', username: 'test', isSuperAdmin: false },
        process.env.JWT_SECRET
      );

      const event = {
        httpMethod: 'POST',
        headers: {
          cookie: `fp_admin=${token}`,
        },
        body: JSON.stringify({ username: 'admintoremove' }),
      };

      const result = await removeAdminHandler(event, {});

      expect(result.statusCode).toBe(403);
    });
  });
});

// Input validation tests
describe('Input Validation', () => {
  it('should sanitize filenames correctly', () => {
    const sanitize = (filename) =>
      filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/__+/g, '_')
        .toLowerCase();

    expect(sanitize('My File (1).pdf')).toBe('my_file_1_.pdf');
    expect(sanitize('test-file.pdf')).toBe('test-file.pdf');
    expect(sanitize('UPPERCASE.PDF')).toBe('uppercase.pdf');
    expect(sanitize('special@#$chars.pdf')).toBe('special_chars.pdf');
  });

  it('should validate class numbers', () => {
    const validClasses = ['10', '11', '12'];
    
    expect(validClasses.includes('10')).toBe(true);
    expect(validClasses.includes('11')).toBe(true);
    expect(validClasses.includes('12')).toBe(true);
    expect(validClasses.includes('9')).toBe(false);
    expect(validClasses.includes('13')).toBe(false);
  });

  it('should validate stream values', () => {
    const validStreams = ['cbse', 'science', 'commerce', 'arts', 'all'];
    
    expect(validStreams.includes('cbse')).toBe(true);
    expect(validStreams.includes('science')).toBe(true);
    expect(validStreams.includes('invalid')).toBe(false);
  });
});
