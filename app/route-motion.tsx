"use client";
import { usePathname } from "next/navigation";
export default function RouteMotion({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  return (
    <div key={path} className="route-enter">
      {children}
    </div>
  );
}
