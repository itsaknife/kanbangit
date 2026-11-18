import Image from "next/image";
import type { IdentityProvider } from "@/services/identity.service";

/** Official provider assets; decorative because the adjacent button names the provider. */
export function ProviderIcon({ provider }: { provider: IdentityProvider }) {
  if (provider === "GOOGLE") {
    return (
      <span aria-hidden="true" className="relative block h-5 w-5 shrink-0 overflow-hidden">
        {/* The official 40px icon asset has 10px clear space around its 20px G. */}
        <Image
          src="/brands/google-sign-in.png"
          alt=""
          width={40}
          height={40}
          className="absolute -left-2.5 -top-2.5 max-w-none"
          unoptimized
        />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="block h-5 w-5 shrink-0">
      <Image
        src="/brands/github-black.svg"
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 object-contain dark:hidden"
      />
      <Image
        src="/brands/github-white.svg"
        alt=""
        width={20}
        height={20}
        className="hidden h-5 w-5 object-contain dark:block"
      />
    </span>
  );
}
