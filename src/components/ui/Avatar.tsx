import Image from "next/image";
import { cn } from "@/utils";
import { env } from "@/config/env";

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  unoptimized?: boolean;
  onError?: () => void;
}

export function Avatar({ src, alt, size = 24, className, unoptimized, onError }: AvatarProps) {
  return (
    <Image
      src={src.startsWith("/avatars/") ? `${env.apiUrl}${src}` : src}
      alt={alt}
      width={size}
      height={size}
      unoptimized={unoptimized || src.startsWith("/avatars/")}
      onError={onError}
      referrerPolicy="no-referrer"
      className={cn("rounded-full", className)}
    />
  );
}
