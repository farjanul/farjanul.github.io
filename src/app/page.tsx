import HomePageClient from "../components/HomePageClient";
import { getContentGroups } from "../lib/data";

export const dynamic = "force-static";

export default async function HomePage() {
  const groups = (await getContentGroups()) as any;
  return <HomePageClient initialGroups={groups || []} />;
}
