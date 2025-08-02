import Editor from '@/components/Editor';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">TTS  Note - Taking App</h1>
      <Editor />
    </main>
  );
}