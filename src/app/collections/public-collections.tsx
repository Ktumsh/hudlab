"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";

import { useFollowedCollections } from "./_hooks/use-followed-collections";
import CollectionGrid from "../../components/collections/collection-grid";
import CollectionsSkeleton from "../../components/collections/collections-skeleton";

import { usePublicCollections } from "@/app/collections/_hooks/use-public-collections";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib";

const PublicCollections = () => {
  const { user } = useAuth();

  const { publicCollections, isLoading: loadingPublic } =
    usePublicCollections();

  const { followed } = useFollowedCollections();

  const [activeTab, setActiveTab] = useState<"highlighted" | "following">(
    "highlighted",
  );
  const [direction, setDirection] = useState(0);

  const handleTabChange = (newTab: "highlighted" | "following") => {
    if (newTab === activeTab) return;
    const newDirection = newTab === "following" ? 1 : -1;
    setDirection(newDirection);
    setActiveTab(newTab);
  };

  const isMobile = useIsMobile();

  return (
    <main className="mt-14 mb-24 py-6 pt-4 md:mt-0 md:mb-32 md:pt-6">
      <div className="relative px-1 md:px-6">
        {isMobile ? (
          <>
            <LayoutGroup>
              <div className="mb-5 flex justify-center">
                <div className="group grid grid-cols-2 gap-0.5">
                  <button
                    onClick={() => handleTabChange("highlighted")}
                    className={cn(
                      "relative flex h-9 flex-1 items-center justify-center px-4 text-sm font-semibold",
                      activeTab === "highlighted" && "text-primary",
                    )}
                  >
                    {activeTab === "highlighted" && (
                      <motion.div
                        layoutId="active-following-tab"
                        className="border-primary absolute inset-0 z-0 border-b-2 transition-colors"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    )}
                    <span className="relative z-1">Destacadas</span>
                  </button>

                  <button
                    onClick={() => handleTabChange("following")}
                    className={cn(
                      "relative flex h-9 flex-1 items-center justify-center px-4 text-sm font-semibold",
                      activeTab === "following" && "text-primary",
                    )}
                  >
                    {activeTab === "following" && (
                      <motion.div
                        layoutId="active-following-tab"
                        className="border-primary absolute inset-0 z-0 border-b-2 transition-colors"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    )}
                    <span className="relative z-1">Seguidas</span>
                  </button>
                </div>
              </div>
            </LayoutGroup>
            <section className="relative flex-1 overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                {activeTab === "highlighted" ? (
                  <motion.div
                    key="highlighted"
                    initial={{ x: direction === 1 ? "100%" : "-100%" }}
                    animate={{ x: "0%" }}
                    exit={{ x: direction === 1 ? "100%" : "-100%" }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                    }}
                  >
                    <CollectionGrid collections={publicCollections} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="following"
                    initial={{ x: direction === 1 ? "100%" : "-100%" }}
                    animate={{ x: "0%" }}
                    exit={{ x: direction === 1 ? "100%" : "-100%" }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                    }}
                  >
                    <CollectionGrid collections={followed} />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </>
        ) : (
          <>
            {user && followed && followed.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold">
                  Colecciones que sigues
                </h2>
                <div className="space-y-8">
                  <CollectionGrid collections={followed} />
                </div>
              </section>
            )}
            <section>
              <h2 className="mb-4 text-xl font-semibold">
                Colecciones destacadas
              </h2>
              {loadingPublic ? (
                <CollectionsSkeleton count={8} />
              ) : publicCollections && publicCollections.length > 0 ? (
                <CollectionGrid collections={publicCollections} />
              ) : (
                <div className="text-content-muted py-4 text-sm">
                  No hay colecciones públicas disponibles en este momento.
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default PublicCollections;
