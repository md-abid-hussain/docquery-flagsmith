import { RepositoryList } from "@/components/admin/repository-list";
import { prisma } from "@/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReposManagementPage() {
  const repos = await prisma.repositories.findMany();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Repository Management</h1>
      <RepositoryList initialRepos={repos} />
    </div>
  );
}
