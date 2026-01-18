import { NextRequest, NextResponse } from 'next/server';

const GH_USER = process.env.GH_USER || process.env.NEXT_PUBLIC_GH_USER || '';
const GH_REPO = process.env.GH_REPO || process.env.NEXT_PUBLIC_GH_REPO || '';

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
