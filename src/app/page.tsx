import Link from "next/link";
import LandingCard from "@/components/LandingCard";
import LithosLogo from "@/components/LithosLogo";
import LithosBackground from "@/components/LithosBackground";
export default function Home() {
  return (
     <main className="relative min-h-screen overflow-hidden bg-[#111111] text-[#F5F5F3] flex flex-col items-center justify-center px-6">
       <LithosBackground />
       <Link
         href="/login"
         className="absolute right-6 top-6 z-20 font-mono text-[11px] tracking-[0.25em] text-[#8A8A8A] transition-colors hover:text-[#1FB07C]"
       >
         CLIENT LOGIN →
       </Link>
        <div className="relative z-10 text-center animate-lithos-fade">
         <LithosLogo />

        <p className="mt-14 text-2xl font-light leading-relaxed">
          Strategic execution.
          <br />
          Creative precision.
          <br />
          Infrastructure delivery.
        </p>


        <div className="mt-16 flex flex-wrap justify-center gap-8">

           <LandingCard
            href="/creative"
            number="01"
            title="Creative"
            description="Brand, product & digital experiences delivered end to end."
           />

           <LandingCard
            href="/infrastructure"
            number="02"
            title="Infrastructure"
            description="Sites, facilities & operations built for growth."
           />

        </div>

	<Link
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
	</Link>

      </div>

    </main>
  );
}
