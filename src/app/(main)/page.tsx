import { getHelath } from "@/libs/api";

export default async function Home() {
  const health = await getHelath();
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white rounded-2xl p-3 border text-black">
        {
          health.health
        }  
      </div>
    </div>
  );
}
