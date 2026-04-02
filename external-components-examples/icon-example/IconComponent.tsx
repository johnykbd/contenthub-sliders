import { css } from "@emotion/css";
import { FC, useEffect, useRef, useState } from "react";

const svgStyles = css({
  lineHeight: 1,
  height: "1em",
  display: "inline-block",
  "& svg": {
    width: "1em",
    height: "1em",
    position: "sticky",
    zIndex: 1,
    verticalAlign: "bottom",
    userSelect: "none",
    fill: "currentColor",
    color: "currentColor",
  },
  "& path[stroke]": {
    stroke: "currentColor",
    fill: "transparent",
  },
});

interface IconComponentProps {
  insertIconInElement: (
    icon: string,
    htmlElement: HTMLElement
  ) => Promise<void>;
  iconName: string;
}

const IconComponent: FC<IconComponentProps> = ({
  insertIconInElement,
  iconName,
}) => {
  const iconRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const loadSvgIcon = async (): Promise<void> => {
      if (iconRef.current) {
        await insertIconInElement(iconName, iconRef.current);
      }
    };

    if (iconName) {
      void loadSvgIcon();
    }
  }, [iconName]);

  return <i ref={iconRef} className={svgStyles} />;
};

export default IconComponent;
