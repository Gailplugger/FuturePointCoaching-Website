import { NextRequest, NextResponse } from 'next/server';

const REPO_OWNER = process.env.REPO_OWNER || process.env.NEXT_PUBLIC_REPO_OWNER || '';
const REPO_NAME = process.env.REPO_NAME || process.env.NEXT_PUBLIC_REPO_NAME || '';

export async function POST(request: NextRequest) {
  try {
    const { filePath, fileSha, githubToken } = await request.json();

    if (!filePath || !fileSha || !githubToken) {
      return NextResponse.json(
        { error: 'File path, SHA, and GitHub token are required' },
        { status: 400 }
      );
    }

    // Delete file from GitHub
    const deleteResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
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
      return NextResponse.json(
        { error: errorData.message || 'Failed to delete file from GitHub' },
        { status: deleteResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
