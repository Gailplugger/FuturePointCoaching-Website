const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const GH_USER = process.env.GH_USER;
const GH_REPO = process.env.GH_REPO;

// Helper to parse cookies
function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      cookies[name] = rest.join('=');
    });
  }
  return cookies;
}

// Helper to verify JWT and check super admin
function verifySuperAdmin(event) {
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie);
  const token = cookies.fp_admin;

  if (!token) {
    return { error: 'No authentication token provided', status: 401 };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded.isSuperAdmin) {
      return { error: 'Super admin privileges required', status: 403 };
    }
    
    return { decoded };
  } catch (err) {
    return { error: 'Invalid or expired token', status: 401 };
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };

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
    // Verify super admin status
    const authResult = verifySuperAdmin(event);
    if (authResult.error) {
      return {
        statusCode: authResult.status,
        headers,
        body: JSON.stringify({ error: authResult.error }),
      };
    }

    const { decoded } = authResult;
    const data = JSON.parse(event.body || '{}');

    const { username, githubToken } = data;

    if (!username || typeof username !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Username is required' }),
      };
    }

    if (!githubToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'GitHub token required' }),
      };
    }

    // Validate username exists on GitHub
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'FuturePointCoaching-Admin',
      },
    });

    if (!userResponse.ok) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'GitHub user not found' }),
      };
    }

    // Fetch current admins.json
    const adminsResponse = await fetch(
      `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/admins/admins.json`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'FuturePointCoaching-Admin',
        },
      }
    );

    if (!adminsResponse.ok) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch admins.json' }),
      };
    }

    const adminsData = await adminsResponse.json();
    const adminsContent = JSON.parse(Buffer.from(adminsData.content, 'base64').toString('utf-8'));

    // Check if user is already an admin
    if (
      adminsContent.super_admins?.includes(username) ||
      adminsContent.admins?.includes(username)
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User is already an admin' }),
      };
    }

    // Add user to admins array
    if (!adminsContent.admins) {
      adminsContent.admins = [];
    }
    adminsContent.admins.push(username);

    // Commit updated admins.json
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/admins/admins.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'FuturePointCoaching-Admin',
        },
        body: JSON.stringify({
          message: `Update admins.json: add ${username} (by ${decoded.username})`,
          content: Buffer.from(JSON.stringify(adminsContent, null, 2)).toString('base64'),
          sha: adminsData.sha,
          branch: 'main',
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      return {
        statusCode: updateResponse.status,
        headers,
        body: JSON.stringify({
          error: 'Failed to update admins.json',
          details: errorData,
        }),
      };
    }

    const result = await updateResponse.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Admin ${username} added successfully`,
        admins: adminsContent,
        commit: {
          sha: result.commit.sha,
          url: result.commit.html_url,
        },
      }),
    };
  } catch (error) {
    console.error('Add admin error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
