"use client";

import { IconPhotoFilled } from "@tabler/icons-react";
import { memo } from "react";

type Props = {
  ratio: number | undefined;
};

const AspectRatioIcon = ({ ratio }: Props) => {
  if (ratio === undefined) {
    return <IconPhotoFilled className="size-4" />;
  }

  const containerSize = 16;
  let width: number, height: number;
  if (ratio >= 1) {
    width = containerSize;
    height = Math.max(containerSize / ratio, 6);
  } else {
    width = Math.max(containerSize * ratio, 6);
    height = containerSize;
  }

  return (
    <div
      className="shrink-0 bg-current transition-colors"
      style={{ width, height }}
    />
  );
};

export default memo(AspectRatioIcon);
