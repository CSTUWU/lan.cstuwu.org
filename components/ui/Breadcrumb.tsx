import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  crumbs: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ crumbs, className = '' }: BreadcrumbProps) {
  return (
    <div className={`flex items-center gap-2 text-xs font-mono text-mutedKhaki mb-8 ${className}`}>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-sand transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-tacticalWhite">{crumb.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

