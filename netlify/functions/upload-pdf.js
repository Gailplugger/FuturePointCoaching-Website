const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;

// Shared session store (Note: In serverless, this will be recreated per invocation)
// For production, use a shared store like Redis or encrypted cookie
let sessions = new Map();

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

// Helper to verify JWT and get session
function verifySession(event) {
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie);
  const token = cookies.fp_admin;

  if (!token) {
    return { error: 'No authentication token provided', status: 401 };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { decoded, token };
  } catch (err) {
    return { error: 'Invalid or expired token', status: 401 };
  }
}

// Sanitize filename
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/__+/g, '_')
    .toLowerCase();
}

// Validate inputs
function validateInputs(data) {
  const errors = [];

  const validClasses = ['10', '11', '12'];
  const validStreams = ['cbse', 'science', 'commerce', 'arts', 'all'];

  if (!data.classNo || !validClasses.includes(String(data.classNo))) {
    errors.push('Class must be 10, 11, or 12');
  }

  if (!data.stream || !validStreams.includes(data.stream.toLowerCase())) {
    errors.push('Stream must be one of: cbse, science, commerce, arts, all');
  }

  if (!data.subject || data.subject.trim().length === 0) {
    errors.push('Subject is required');
  }

  if (!data.fileName || !data.fileName.toLowerCase().endsWith('.pdf')) {
    errors.push('File must be a PDF');
  }

  if (!data.fileBase64) {
    errors.push('File content is required');
  } else {
    // Check file size (base64 is ~33% larger than original)
    const sizeInBytes = (data.fileBase64.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB > 20) {
      errors.push('File size must be less than 20MB');
    }
  }

  return errors;
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
    // Verify authentication
    const authResult = verifySession(event);
    if (authResult.error) {
      return {
        statusCode: authResult.status,
        headers,
        body: JSON.stringify({ error: authResult.error }),
      };
    }

    const { decoded } = authResult;

    // Parse request body
    const data = JSON.parse(event.body || '{}');

    // Validate inputs
    const validationErrors = validateInputs(data);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ errors: validationErrors }),
      };
    }

    const { fileBase64, fileName, classNo, stream, subject, commitMessage, githubToken } = data;

    // Use the provided GitHub token for this request
    if (!githubToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'GitHub token required for upload' }),
      };
    }

    // Build file path
    const sanitizedSubject = sanitizeFilename(subject);
    const sanitizedFileName = sanitizeFilename(fileName);
    const filePath = `notes/class-${classNo}/${stream.toLowerCase()}/${sanitizedSubject}/${sanitizedFileName}`;

    // Check if file exists (to get SHA for update)
    let existingSha = null;
    try {
      const existingFileResponse = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'FuturePointCoaching-Admin',
          },
        }
      );

      if (existingFileResponse.ok) {
        const existingFile = await existingFileResponse.json();
        existingSha = existingFile.sha;
      }
    } catch (e) {
      // File doesn't exist, that's fine
    }

    // Prepare commit payload
    const commitPayload = {
      message: commitMessage || `Upload ${fileName} by ${decoded.username}`,
      content: fileBase64,
      branch: 'main',
    };

    if (existingSha) {
      commitPayload.sha = existingSha;
    }

    // Upload file via GitHub Contents API
    const uploadResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'FuturePointCoaching-Admin',
        },
        body: JSON.stringify(commitPayload),
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      
      if (uploadResponse.status === 409) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            error: 'Conflict: File was modified. Please try again.',
            details: errorData,
          }),
        };
      }

      return {
        statusCode: uploadResponse.status,
        headers,
        body: JSON.stringify({
          error: 'Failed to upload file',
          details: errorData,
        }),
      };
    }

    const result = await uploadResponse.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: existingSha ? 'File updated successfully' : 'File uploaded successfully',
        file: {
          path: result.content.path,
          sha: result.content.sha,
          downloadUrl: result.content.download_url,
          htmlUrl: result.content.html_url,
        },
        commit: {
          sha: result.commit.sha,
          url: result.commit.html_url,
        },
      }),
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
