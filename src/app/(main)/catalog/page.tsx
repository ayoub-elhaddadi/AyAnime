
import { CatalogContent } from "@/components/catalog/CatalogContent";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "Catalog | AyAnime",
    description: "Browse and discover thousands of anime titles on AyAnime.",
};

export default function CatalogPage() {
    return (
        <main className="min-h-screen pb-20 pt-24 bg-black">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-zinc-500 font-medium animate-pulse">Initializing Catalog...</p>
                </div>
            }>
                <CatalogContent />
            </Suspense>
        </main>
    );
}
