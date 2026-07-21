/**
 * Admin route group layout.
 * Imports admin-specific CSS and renders children WITHOUT the public
 * Navbar, Footer, or FloatingActions. The public ClientShell detects
 * /admin routes and renders only {children} — this layout then adds
 * the admin.css styles needed by all admin pages.
 */
import "./admin.css";

export const metadata = {
  title: "Mabel Homes Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
