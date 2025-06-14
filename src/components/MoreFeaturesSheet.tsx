
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Store,
  Building,
  Camera,
  AlertCircle,
  FileText,
  Map,
  ListChecks,
  Headset,
  Grid, // Assuming Grid was meant to be an icon for "Ferramentas" or similar
  Wrench, // Added Wrench for Ferramentas
} from "lucide-react";

interface Feature {
  icon: React.ElementType;
  label: string;
  href: string;
}

// Updated to match typical app structure, "Ferramentas" might be a key one.
const iconGridFeatures: Feature[] = [
  { icon: Store, label: "Guia Comercial", href: "/guia-comercial" },
  { icon: Building, label: "Turismo", href: "/turismo" },
  { icon: Camera, label: "Streaming", href: "/streaming" },
  { icon: AlertCircle, label: "Alertas", href: "/alertas" },
  // { icon: FileText, label: "Notícias", href: "/noticias" }, // Assuming Notícias might not be a primary grid item
  // { icon: Map, label: "Mapa", href: "/mapa" }, // Assuming Mapa might not be a primary grid item
  { icon: Wrench, label: "Ferramentas", href: "/ferramentas"}, // Adding a general "Tools" section
  { icon: ListChecks, label: "Checklist", href: "/ferramentas/checklist" },
  { icon: Headset, label: "Contato SAU", href: "/sau" },
  // Add one more to make it an even 8 if desired, or leave as 7.
  // For example, if "Notícias" or "Mapa" are important enough for the grid.
  // Let's add Notícias back for an even grid for now.
  { icon: FileText, label: "Notícias", href: "/noticias" },
];

interface MoreFeaturesSheetProps {
  children: React.ReactNode; // This 'children' is the trigger
}

const MoreFeaturesSheet: React.FC<MoreFeaturesSheetProps> = ({ children }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-[25px]">
        <SheetHeader className="pt-2 pb-2"> {/* Reduced padding */}
          <SheetTitle className="text-center font-headline text-lg">Mais Funcionalidades</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-4 gap-2 p-3"> {/* Reduced gap and padding */}
          {iconGridFeatures.map((feature) => (
            <Link href={feature.href} key={feature.label} legacyBehavior>
              <a className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                <Button
                  variant="ghost"
                  className="flex flex-col items-center justify-center h-20 w-full p-1" // Reduced height and padding
                >
                  <feature.icon className="h-7 w-7 mb-1 text-primary" /> {/* Adjusted icon size and margin */}
                  <span className="text-xs text-center text-muted-foreground leading-tight">{feature.label}</span>
                </Button>
              </a>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MoreFeaturesSheet;
