import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { createTemplate, getTemplatesByUserId, getUserByEmail } from '@/lib/database';
import { getLatestCommit } from '@/lib/github';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const templates = await getTemplatesByUserId(user.id);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check plan limits
    if (user.plan === 'free') {
      const existingTemplates = await getTemplatesByUserId(user.id);
      if (existingTemplates.length >= 1) {
        return NextResponse.json(
          { error: 'Free plan is limited to 1 template. Upgrade to Pro for unlimited templates.' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { templateName, repoUrl, branchName, commitHash } = body;

    if (!templateName || !repoUrl || !branchName) {
      return NextResponse.json(
        { error: 'Template name, repository URL, and branch name are required' },
        { status: 400 }
      );
    }

    // Get latest commit if not provided
    let finalCommitHash = commitHash;
    if (!finalCommitHash) {
      try {
        // For now, we'll use a placeholder since we need GitHub access token
        // In a real implementation, you'd get the user's GitHub token from Auth0 or store it
        finalCommitHash = 'latest'; // This would be replaced with actual commit hash
      } catch (error) {
        console.error('Error getting latest commit:', error);
        finalCommitHash = 'main'; // Fallback
      }
    }

    const template = await createTemplate({
      userId: user.id,
      templateName,
      repoUrl,
      branchName,
      commitHash: finalCommitHash
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}