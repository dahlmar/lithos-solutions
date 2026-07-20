export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] text-[#F5F5F3] flex flex-col items-center justify-center px-6">

      <div className="text-center">

        <h1 className="text-6xl font-medium tracking-[0.4em]">
          LITHOS
        </h1>

        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="h-px w-10 bg-white/20" />

          <span className="text-xs tracking-[0.4em] text-[#8A8A8A] font-mono">
            SOLUTIONS
          </span>

          <span className="h-px w-10 bg-white/20" />
        </div>


        <p className="mt-14 text-2xl font-light leading-relaxed">
          Strategic execution.
          <br />
          Creative precision.
          <br />
          Infrastructure delivery.
        </p>


        <div className="flex gap-5 mt-14 flex-wrap justify-center">

          <a
            href="/creative"
            className="
            w-64 p-7
            rounded-2xl
            bg-white/[0.03]
            border border-white/10
            backdrop-blur-xl
            hover:border-[#1FB07C]/50
            hover:bg-[#1FB07C]/10
            transition
            "
          >
            <div className="text-xl font-medium">
              Creative
            </div>

            <p className="mt-3 text-sm text-[#8A8A8A]">
              Brand, product and digital experiences delivered end to end.
            </p>

          </a>


          <a
            href="/infrastructure"
            className="
            w-64 p-7
            rounded-2xl
            bg-white/[0.03]
            border border-white/10
            backdrop-blur-xl
            hover:border-[#1FB07C]/50
            hover:bg-[#1FB07C]/10
            transition
            "
          >

            <div className="text-xl font-medium">
              Infrastructure
            </div>

            <p className="mt-3 text-sm text-[#8A8A8A]">
              Sites, facilities and operations built for growth.
            </p>

          </a>

        </div>


        <a
          href="/login"
          className="
          block mt-12
          text-xs
          font-mono
          tracking-[0.25em]
          text-[#8A8A8A]
          hover:text-[#1FB07C]
          "
        >
          CLIENT LOGIN →
        </a>


      </div>

    </main>
  );
}
