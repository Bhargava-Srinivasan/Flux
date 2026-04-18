'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WorkspaceDetails {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    memberships: number;
  };
}

export default function WorkspaceDetailsPage({
  params,
}: {
  params: { orgId: string; workspaceId: string };
}) {
  const [workspace, setWorkspace] = useState<WorkspaceDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const response = await api.get(`/workspaces/${params.workspaceId}`);
        setWorkspace(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load workspace');
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [params.workspaceId]);

  if (loading) {
    return <div>Loading workspace...</div>;
  }

  if (error || !workspace) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">{error || 'Workspace not found'}</p>
        <Link href={`/${params.orgId}`}>
          <Button variant="outline">Back to Organization</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{workspace.organization.name}</p>
          <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
        </div>
        <Link href={`/${params.orgId}`}>
          <Button variant="outline">Back to Organization</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-medium">Slug:</span> {workspace.slug}
          </div>
          <div>
            <span className="font-medium">Members:</span> {workspace._count.memberships}
          </div>
          <div>
            <span className="font-medium">Created:</span>{' '}
            {new Date(workspace.createdAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
