
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { 
  Newspaper, 
  ShoppingCart, 
  Store, 
  Link as LinkIcon, 
  Video, 
  MessageCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/contexts/ChatContext";

interface Feature {
  icon: React.ElementType;
  label: string;
  href?: string;
  isExternal?: boolean;
  onClick?: () => void;
}

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
  const { openChat } = useChat();

  const iconGridFeatures: Feature[] = [
    { icon: Video, label: "AO VIVO", href: "/streaming" },
    { icon: MessageCircle, label: "Chat277", onClick: openChat },
    { icon: LinkIcon, label: "Bio Link", href: "https://grupobr277.com.br/bio-link/", isExternal: true },
    { icon: Newspaper, label: "Notícias", href: "https://nossodia.com.br/", isExternal: true },
    { icon: ShoppingCart, label: "CargoShop (Em Breve)", href: "/cargo-shop" },
    { icon: Store, label: "Marketplace (Em Breve)", href: "/marketplace" },
  ];

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

        <div className="grid grid-cols-4 gap-0 p-1.5 flex-grow overflow-y-auto">
          {iconGridFeatures.map((feature) => {
            const featureContent = (
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
            );

            const commonProps = {
              className: "block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-background rounded-lg",
            };

            return (
              <SheetClose asChild key={feature.label}>
                {feature.href ? (
                  <Link
                    href={feature.href}
                    onClick={feature.onClick}
                    passHref={!feature.isExternal}
                    target={feature.isExternal ? "_blank" : undefined}
                    rel={feature.isExternal ? "noopener noreferrer" : undefined}
                    {...commonProps}
                  >
                    {featureContent}
                  </Link>
                ) : (
                  <button onClick={feature.onClick} {...commonProps}>
                    {featureContent}
                  </button>
                )}
              </SheetClose>
            );
          })}
        </div>
        <AdPlaceholder />
      </SheetContent>
    </Sheet>
  );
};

export default MoreFeaturesSheet;
