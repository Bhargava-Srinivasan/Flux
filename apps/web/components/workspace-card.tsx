import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface WorkspaceCardProps {
  id: string;
  name: string;
  memberCount: number;
  description?: string;
  orgId: string;
}

export function WorkspaceCard({ id, name, memberCount, description, orgId }: WorkspaceCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Random bg color for avatar based on name char code
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={`${avatarColor} text-white`}>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-bold">{name}</CardTitle>
            <p className="text-xs text-muted-foreground">{memberCount} members</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 min-h-[3rem]">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description || 'No description provided.'}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Link href={`/${orgId}/workspace/${id}`} className="w-full mr-2">
            <Button className="w-full">Open Workspace</Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
