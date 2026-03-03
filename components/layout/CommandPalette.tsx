'use client';

import { useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Package, Award, Truck, MapPin } from 'lucide-react';
import { useAMSStore } from '@/lib/store';

export function CommandPalette() {
  const open = useAMSStore((s) => s.commandOpen);
  const setOpen = useAMSStore((s) => s.setCommandOpen);
  const assets = useAMSStore((s) => s.assets);
  const brands = useAMSStore((s) => s.brands);
  const suppliers = useAMSStore((s) => s.suppliers);
  const branches = useAMSStore((s) => s.branches);
  const setActivePage = useAMSStore((s) => s.setActivePage);
  const setSelectedAsset = useAMSStore((s) => s.setSelectedAsset);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search assets, brands, suppliers..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Assets">
          {assets.slice(0, 8).map((a) => (
            <CommandItem
              key={a.id}
              onSelect={() => {
                setActivePage('assets');
                setSelectedAsset(a.id);
                setOpen(false);
              }}
            >
              <Package className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{a.name}</span>
              <span className="ml-auto text-xs text-muted-foreground font-mono">{a.assetCode}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Brands">
          {brands.map((b) => (
            <CommandItem
              key={b.id}
              onSelect={() => {
                setActivePage('brands');
                setOpen(false);
              }}
            >
              <Award className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{b.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Suppliers">
          {suppliers.map((s) => (
            <CommandItem
              key={s.id}
              onSelect={() => {
                setActivePage('suppliers');
                setOpen(false);
              }}
            >
              <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{s.companyName}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Branches">
          {branches.map((b) => (
            <CommandItem
              key={b.id}
              onSelect={() => {
                setActivePage('settings');
                setOpen(false);
              }}
            >
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{b.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{b.city}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
