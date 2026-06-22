export function SectionHeading({
  eyebrow,
  title,
  text,
  light = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`mb-4 text-xs font-bold uppercase tracking-[0.28em] ${light ? "text-sand-300" : "text-gold"}`}>
        {eyebrow}
      </p>
      <h2 className={`break-words font-display text-[2.15rem] leading-[1.08] sm:text-5xl lg:text-6xl ${light ? "text-white" : "text-forest-900"}`}>
        {title}
      </h2>
      {text && <p className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg ${light ? "text-sand-200" : "text-stone-600"}`}>{text}</p>}
    </div>
  );
}
