export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img
      src="/genz-logo.jpg"
      alt="GenZ"
      className={`${className} rounded-lg object-cover`}
      loading="eager"
    />
  );
}
