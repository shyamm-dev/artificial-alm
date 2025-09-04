"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface UserProfileIslandProps {
  userDetails: {
    name: string;
    email: string;
    imageUrl: string | undefined;
  }
}

export default function UserProfileIsland({ userDetails }: UserProfileIslandProps) {
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  }

  return (
    <Card className="w-auto py-2">
      <CardContent className="flex items-center space-x-4 px-4">

        {/* User Profile Badge */}
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={userDetails.imageUrl} alt={userDetails.name} />
            <AvatarFallback>{userDetails.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{userDetails.name}</span>
        </div>

        {/* Signout Icon */}
        <Button onClick={handleSignOut} variant="ghost" size="icon" className="text-gray-600 hover:text-red-500">
          <LogOut className="h-6 w-6" />
        </Button>
      </CardContent>
    </Card>
  );
}
