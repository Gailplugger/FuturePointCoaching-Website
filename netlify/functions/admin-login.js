const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const GH_USER = process.env.GH_USER;
const GH_REPO = process.env.GH_REPO;

// In-memory session store (for ephemeral PAT storage)
// In production, consider using encrypted storage or Redis
const sessions = new Map();

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { username: providedUsername, token } = JSON.parse(event.body || '{}');

    if (!providedUsername || typeof providedUsername !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'GitHub username is required' }),
      };
    }

    if (!token || typeof token !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'GitHub Personal Access Token is required' }),
      };
    }

    // Validate PAT by calling GitHub API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'FuturePointCoaching-Admin',
      },
    });

    if (!userResponse.ok) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid GitHub token' }),
      };
    }

    const userData = await userResponse.json();
    const username = userData.login;

    // Verify the provided username matches the token owner
    if (providedUsername.toLowerCase() !== username.toLowerCase()) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Username verification failed',
          details: 'The provided username does not match the token owner. Please ensure you entered your correct GitHub username.'
        }),
      };
    }

    // Fetch admins.json from the repo
    const adminsResponse = await fetch(
      `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/admins/admins.json`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'FuturePointCoaching-Admin',
        },
      }
    );

    if (!adminsResponse.ok) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Unable to verify admin status. Check repository access.' }),
      };
    }

    const adminsData = await adminsResponse.json();
    const adminsContent = JSON.parse(Buffer.from(adminsData.content, 'base64').toString('utf-8'));

    const isSuperAdmin = adminsContent.super_admins?.includes(username);
    const isAdmin = adminsContent.admins?.includes(username);

    if (!isSuperAdmin && !isAdmin) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'You are not authorized as an admin' }),
      };
    }

    // Generate session ID and store PAT (encrypted in production)
    const sessionId = require('crypto').randomUUID();
    sessions.set(sessionId, {
      token,
      username,
      isSuperAdmin,
      createdAt: Date.now(),
    });

    // Clean up old sessions (older than 2 hours)
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    for (const [sid, session] of sessions.entries()) {
      if (Date.now() - session.createdAt > TWO_HOURS) {
        sessions.delete(sid);
      }
    }

    // Create JWT
    const jwtPayload = {
      sessionId,
      username,
      isSuperAdmin,
      exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 hours
    };

    const jwtToken = jwt.sign(jwtPayload, JWT_SECRET);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Set-Cookie': `fp_admin=${jwtToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200`,
      },
      body: JSON.stringify({
        success: true,
        user: {
          username,
          isSuperAdmin,
          avatar: userData.avatar_url,
        },
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Export sessions for other functions
exports.sessions = sessions;
