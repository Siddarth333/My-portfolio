import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";
import { PROFILE_INITIALS, PROFILE_NAME } from "@/lib/profile";
import { getProfilePhoto } from "@/lib/media.functions";

export function useProfilePhoto() {
  const fetchPhoto = useServerFn(getProfilePhoto);
  return useQuery({
    queryKey: ["profile-photo"],
    queryFn: () => fetchPhoto({}),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Small circular profile badge. The photo is always cropped from its centre
 * with `object-cover`, so it never stretches or skews at any size. Without a
 * photo it falls back to a clean monogram.
 */
export function ProfileAvatar({
  size = 32,
  className,
  asLink = true,
}: {
  size?: number;
  className?: string;
  asLink?: boolean;
}) {
  const { data } = useProfilePhoto();
  const photo = data?.url ?? null;

  const inner = (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary ring-1 ring-primary/30 transition-all duration-300 hover:ring-2 hover:ring-primary",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {photo ? (
        <img
          src={photo}
          alt={`${PROFILE_NAME} — portrait`}
          width={size}
          height={size}
          loading="lazy"
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <span
          className="font-display font-semibold tracking-tight text-primary"
          style={{ fontSize: Math.max(10, size * 0.36) }}
        >
          {PROFILE_INITIALS}
        </span>
      )}
    </span>
  );

  if (!asLink) return inner;

  return (
    <Link to="/personal" aria-label={`About ${PROFILE_NAME}`} className="inline-flex">
      {inner}
    </Link>
  );
}
