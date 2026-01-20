import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SongsList } from "./SongsList";

export default async function SongsPage() {
  const authenticated = await isAdmin();
  if (!authenticated) {
    redirect("/admin");
  }

  const allSongs = await db.query.songs.findMany({
    orderBy: (songs, { asc }) => [asc(songs.artist), asc(songs.title)],
  });

  return (
    <main className="max-w-4xl mx-auto p-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Song Library</h1>
        <p className="text-backdrop-500">{allSongs.length} songs</p>
      </div>

      <SongsList initialSongs={allSongs} />
    </main>
  );
}
