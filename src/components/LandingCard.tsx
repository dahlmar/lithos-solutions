import Link from "next/link";

type LandingCardProps = {
  href: string;
  number: string;
  title: string;
  description: string;
};

export default function LandingCard({
  href,
  number,
  title,
  description,
}: LandingCardProps) {
  return (
    <Link
      href={href}
      className="
      group
      w-72
      rounded-2xl
      border
      border-white/10
      bg-white/5
      backdrop-blur-md
      p-8
      transition-all
      duration-300
      hover:-translate-y-2
      hover:border-emerald-500/50
      hover:bg-emerald-500/10
      "
    >
      <div className="flex items-center justify-between">

        <div className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          border
          border-white/20
        ">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
        </div>

        <span className="font-mono text-xs tracking-[0.3em] text-gray-500">
          {number}
        </span>

      </div>

      <h3 className="mt-8 text-2xl font-medium">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-400">
        {description}
      </p>
    </Link>
  );
}
