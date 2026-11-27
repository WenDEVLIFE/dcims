import { ProjectDetailContent } from "@/features/projects/project-detail-content";
import { projects } from "@/data/projects";

/**
 * Seed projects are prerendered so the route has a known parameter list.
 * Projects created at runtime still render on demand, because dynamicParams
 * stays enabled by default and the data lives in the client store.
 */
export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetailContent projectId={id} />;
}
