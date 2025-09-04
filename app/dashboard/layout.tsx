import UserProfileIsland from '@/components/UserProfileIsland';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const data = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="relative min-h-screen bg-gray-100">
      {data?.user &&
        <div className="absolute top-4 right-4 z-10">
          <UserProfileIsland userDetails={{
            name: data.user.name,
            email: data.user.email,
            imageUrl: data.user.image ?? undefined
          }} />
        </div>
      }
      <main className="p-8 pt-20">
        {children}
      </main>
    </div>
  );
}
