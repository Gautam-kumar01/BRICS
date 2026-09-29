import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, updateProjectMilestone } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const projects = await getAllProjects();
    return NextResponse.json(projects);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, milestoneId, status, actor } = body;

    const updated = await updateProjectMilestone(projectId, milestoneId, status, actor);
    if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
