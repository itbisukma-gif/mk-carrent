
// This file is likely a remnant of previous structures and might not be needed.
// A layout at `/invoice/layout.tsx` would wrap `/invoice/[id]/...` which is not what we want.
// For now, let's make it a simple pass-through to avoid conflicts.
// It will be cleaned up if it proves unnecessary.

export default function InvoiceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

    