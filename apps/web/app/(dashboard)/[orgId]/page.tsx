'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CreateWorkspaceDialog } from '@/components/create-workspace-dialog';
import { WorkspaceCard } from '@/components/workspace-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  _count: {
    memberships: number;
  };
}

export default function WorkspacesPage({ params }: { params: { orgId: string } }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/workspaces?organizationId=${params.orgId}`);
      setWorkspaces(data);
      setError(false);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [params.orgId]);

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8" data-testid="workspace-list">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground">Manage workspaces inside this organization</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search workspaces..."
              className="w-[250px] pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div data-testid="create-workspace-btn">
            <CreateWorkspaceDialog organizationId={params.orgId} onCreated={fetchWorkspaces} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500">Failed to load workspaces. Please try again.</div>
      ) : filteredWorkspaces.length === 0 ? (
        <div
          className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50"
          data-testid="empty-state"
        >
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <span className="text-3xl">WS</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold">No workspaces yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Create your first workspace to start managing projects.
            </p>
            <CreateWorkspaceDialog organizationId={params.orgId} onCreated={fetchWorkspaces} />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredWorkspaces.map((ws) => (
            <div key={ws.id} data-testid="workspace-card">
              <WorkspaceCard
                id={ws.id}
                name={ws.name}
                memberCount={ws._count.memberships}
                orgId={params.orgId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
