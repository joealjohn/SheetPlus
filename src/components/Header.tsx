import Link from 'next/link';
import SheetLogo from './icons/SheetLogo';
import { ModeToggle } from './mode-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <SheetLogo className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Sheets+
          </span>
        </Link>
        <ModeToggle />
      </div>
    </header>
  );
}
