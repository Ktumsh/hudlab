"use client";

import { AnimatePresence, motion } from "motion/react";

import AdjustmentsPanel from "./adjustments-panel";
import CropPanel from "./crop-panel";
import FiltersPanel from "./filters-panel";

import type { FilterSettings } from "@/hooks/use-image-filters";

interface ControlsPanelProps {
  activeTab: string;
  originalImage: HTMLImageElement | null;
  imageUrl: string;
  filters: FilterSettings;
  setFilters: (filters: FilterSettings) => void;
  resetFilter: (filter: keyof FilterSettings) => void;
  isFilterModified: (filter: keyof FilterSettings) => boolean;
  handleAspectRatioChange: (aspectRatio: number | undefined) => void;
  selectedAspectRatio: number | undefined;
  commitHistorySoon?: () => void;
}

const ControlsPanel = ({
  activeTab,
  originalImage,
  imageUrl,
  filters,
  setFilters,
  resetFilter,
  isFilterModified,
  handleAspectRatioChange,
  selectedAspectRatio,
  commitHistorySoon,
}: ControlsPanelProps) => {
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  return (
    <div className="flex h-26 items-center justify-center py-2">
      <AnimatePresence initial={false} mode="popLayout">
        {activeTab === "crop" && (
          <motion.div
            key="crop"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-lg"
          >
            <CropPanel
              selectedAspectRatio={selectedAspectRatio}
              handleAspectRatioChange={handleAspectRatioChange}
            />
          </motion.div>
        )}
        {activeTab === "adjustments" && (
          <motion.div
            key="adjustments"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-lg"
          >
            <AdjustmentsPanel
              filters={filters}
              setFilters={setFilters}
              resetFilter={resetFilter}
              isFilterModified={isFilterModified}
              commitHistorySoon={commitHistorySoon}
            />
          </motion.div>
        )}
        {activeTab === "filters" && (
          <motion.div
            key="filters"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-lg"
          >
            <FiltersPanel
              originalImage={originalImage}
              imageUrl={imageUrl}
              setFilters={setFilters}
              filters={filters}
              commitHistorySoon={commitHistorySoon}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ControlsPanel;
