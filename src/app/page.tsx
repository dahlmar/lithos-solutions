export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-light tracking-wide mb-4">
        Lithos Solutions
      </h1>

      <p className="text-gray-400 mb-12">
        Boutique consulting for growing businesses.
      </p>

      <div className="flex gap-8">
        <a
          href="/creative"
          className="border border-white px-10 py-5 rounded-lg hover:bg-white hover:text-black transition"
        >
          Creative
        </a>

        <a
          href="/infrastructure"
          className="border border-white px-10 py-5 rounded-lg hover:bg-white hover:text-black transition"
        >
          Infrastructure
        </a>
      </div>
    </main>
  );
}
