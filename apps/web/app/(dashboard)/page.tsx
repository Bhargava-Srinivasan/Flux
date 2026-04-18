'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { CreateOrganizationDialog } from '@/components/create-organization-dialog';

interface Organization {
  id: string;
  name: string;
  slug: string;
  _count: {
    workspaces: number;
    memberships: number;
  };
}

export default function DashboardPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = async () => {
    try {
      const { data } = await api.get('/organizations');
      setOrganizations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6" data-testid="org-list">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        <div data-testid="create-org-btn">
          <CreateOrganizationDialog onCreated={fetchOrgs} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Link href={`/${org.id}`} key={org.id} data-testid="org-card">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>{org.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {org._count.workspaces} Workspaces • {org._count.memberships} Members
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
