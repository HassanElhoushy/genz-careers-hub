import logoAsset from "@/assets/genz-logo.asset.json";

export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="GenZ"
      className={`${className} rounded-lg object-cover`}
      loading="eager"
    />
  );
}
