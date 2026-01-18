const GH_USER = process.env.GH_USER;
const GH_REPO = process.env.GH_REPO;

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
    if (sizeInMB > 50) {
      errors.push('File size must be less than 50MB');
    }
  }

  return errors;
}

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
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    let data;
    try {
      data = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    const { fileBase64, fileName, classNo, stream, subject, commitMessage, githubToken } = data;

    // Validate GitHub token
    if (!githubToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'GitHub token is required' }),
      };
    }

    // Verify the GitHub token is valid
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

    const githubUser = await userResponse.json();

    // Validate inputs
    const validationErrors = validateInputs(data);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ errors: validationErrors }),
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
        `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${filePath}`,
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
      message: commitMessage || `Upload ${fileName} by ${githubUser.login}`,
      content: fileBase64,
      branch: 'main',
    };

    if (existingSha) {
      commitPayload.sha = existingSha;
    }

    // Upload file via GitHub Contents API
    const uploadResponse = await fetch(
      `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${filePath}`,
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
