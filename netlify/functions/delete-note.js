const GH_USER = process.env.GH_USER;
const GH_REPO = process.env.GH_REPO;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { filePath, fileSha, githubToken } = JSON.parse(event.body);

    if (!filePath || !fileSha || !githubToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File path, SHA, and GitHub token are required' }),
      };
    }

    // Verify the GitHub token is valid by checking user
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${githubToken}`,
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

    // Delete file from GitHub
    const deleteResponse = await fetch(
      `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'FuturePointCoaching-Admin',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Delete note: ${filePath.split('/').pop()}`,
          sha: fileSha,
        }),
      }
    );

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      return {
        statusCode: deleteResponse.status,
        headers,
        body: JSON.stringify({ error: errorData.message || 'Failed to delete file' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Note deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Delete note error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
