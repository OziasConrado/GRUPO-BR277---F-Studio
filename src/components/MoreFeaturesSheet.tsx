
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Store,
  Building,
  Camera,
  AlertCircle,
  FileText,
  ListChecks,
  Headset,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  icon: React.ElementType;
  label: string;
  href: string;
}

const iconGridFeatures: Feature[] = [
  { icon: Store, label: "Guia Comercial", href: "/guia-comercial" },
  { icon: Building, label: "Turismo", href: "/turismo" },
  { icon: Camera, label: "Streaming", href: "/streaming" },
  { icon: AlertCircle, label: "Alertas", href: "/alertas" },
  { icon: Wrench, label: "Ferramentas", href: "/ferramentas"},
  { icon: ListChecks, label: "Checklist", href: "/ferramentas/checklist" },
  { icon: Headset, label: "Contato SAU", href: "/sau" },
  { icon: FileText, label: "Notícias", href: "/noticias" },
];

interface MoreFeaturesSheetProps {
  children: React.ReactNode;
}

const AdPlaceholder = () => (
  <div className="mt-auto p-3">
    <div className="h-14 bg-muted/50 rounded-lg flex items-center justify-center text-sm text-muted-foreground border border-dashed">
      Espaço para Banner AdMob
    </div>
  </div>
);

const MoreFeaturesSheet: React.FC<MoreFeaturesSheetProps> = ({ children }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[60vh] rounded-t-2xl p-0 flex flex-col"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-center font-headline text-lg">Mais Funcionalidades</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-4 gap-0.5 p-2 flex-grow overflow-y-auto">
          {iconGridFeatures.map((feature) => (
            <SheetClose asChild key={feature.label}>
              <Link
                href={feature.href}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-background rounded-lg"
              >
                <div
                  role="button"
                  className={cn(
                    "flex flex-col items-center justify-center h-[70px] w-full p-1 rounded-lg transition-colors duration-150",
                    "hover:bg-primary/5 dark:hover:bg-primary/10",
                    "focus-visible:bg-primary/10 dark:focus-visible:bg-primary/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                  )}
                >
                  <feature.icon className="h-6 w-6 mb-1 text-primary" />
                  <span className="text-[10px] text-center text-muted-foreground leading-tight">{feature.label}</span>
                </div>
              </Link>
            </SheetClose>
          ))}
        </div>

        <AdPlaceholder />
      </SheetContent>
    </Sheet>
  );
};

export default MoreFeaturesSheet;
