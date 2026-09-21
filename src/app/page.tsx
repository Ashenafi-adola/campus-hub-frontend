import { getHelath } from "@/libs/api";

export default async function Home() {
  const health = await getHelath();
  return (
    <div>
      {
        health.health
      }
    </div>
  );
}
