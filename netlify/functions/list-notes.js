const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;

// Recursively fetch directory contents
async function fetchDirectoryContents(path, token) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'FuturePointCoaching-Notes',
  };
  
  if (token) {
    headers.Authorization = `token ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const contents = await response.json();
  return contents;
}

// Build nested structure from flat file list
function buildNotesStructure(files) {
  const structure = {};

  files.forEach((file) => {
    // Parse path: notes/class-{classNo}/{stream}/{subject}/{filename}
    const pathParts = file.path.split('/');
    
    if (pathParts.length >= 5 && pathParts[0] === 'notes') {
      const classDir = pathParts[1]; // class-10, class-11, class-12
      const stream = pathParts[2];
      const subject = pathParts[3];
      const fileName = pathParts.slice(4).join('/');

      const classNo = classDir.replace('class-', '');

      if (!structure[classNo]) {
        structure[classNo] = {};
      }
      if (!structure[classNo][stream]) {
        structure[classNo][stream] = {};
      }
      if (!structure[classNo][stream][subject]) {
        structure[classNo][stream][subject] = [];
      }

      structure[classNo][stream][subject].push({
        name: fileName,
        path: file.path,
        size: file.size,
        sha: file.sha,
        downloadUrl: file.download_url,
        htmlUrl: file.html_url,
      });
    }
  });

  return structure;
}

// Recursively get all files in a directory
async function getAllFiles(path, token, allFiles = []) {
  const contents = await fetchDirectoryContents(path, token);

  for (const item of contents) {
    if (item.type === 'file' && item.name.toLowerCase().endsWith('.pdf')) {
      allFiles.push(item);
    } else if (item.type === 'dir') {
      await getAllFiles(item.path, token, allFiles);
    }
  }

  return allFiles;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Optional: Use token from query params for authenticated requests (higher rate limit)
    const params = event.queryStringParameters || {};
    const token = params.token || null;

    // Get all PDF files from notes directory
    const allFiles = await getAllFiles('notes', token);

    // Build structured response
    const structure = buildNotesStructure(allFiles);

    // Also return flat list for easy filtering
    const flatList = allFiles.map((file) => {
      const pathParts = file.path.split('/');
      return {
        name: file.name,
        path: file.path,
        classNo: pathParts[1]?.replace('class-', '') || '',
        stream: pathParts[2] || '',
        subject: pathParts[3] || '',
        size: file.size,
        downloadUrl: file.download_url,
        htmlUrl: file.html_url,
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        structure,
        files: flatList,
        total: flatList.length,
        lastUpdated: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('List notes error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch notes list' }),
    };
  }
};
