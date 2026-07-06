"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { ServiceContent } from "@/lib/cms";
import { cn } from "@/lib/cn";
import styles from "./styles.module.css";

export function ServicesExplorer({
  services,
}: {
  services: readonly ServiceContent[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeService = activeIndex === null ? null : services[activeIndex];
  const glowClass = useMemo(
    () =>
      activeIndex === null
        ? null
        : glowClasses[activeIndex % glowClasses.length],
    [activeIndex],
  );

  return (
    <div
      className={styles.root}
      onMouseLeave={() => {
        if (hasFinePointer()) setActiveIndex(null);
      }}
    >
      <div className={styles.list} aria-label="Services">
        {services.map((service, index) => {
          const selected = activeIndex === index;
          const panelId = `service-panel-${service.num}`;
          const triggerId = `service-trigger-${service.num}`;
          const IndicatorIcon = selected ? Minus : Plus;

          return (
            <div key={service._key ?? service.title} className={styles.item}>
              <button
                id={triggerId}
                type="button"
                aria-expanded={selected}
                aria-controls={panelId}
                className={cn(styles.trigger, selected && styles.active)}
                onMouseEnter={() => {
                  if (hasFinePointer()) setActiveIndex(index);
                }}
                onClick={() => setActiveIndex(selected ? null : index)}
              >
                <span className={styles.num}>{service.num}</span>
                <span className={styles.title}>{service.title}</span>
                <span className={styles.indicator} aria-hidden="true">
                  <IndicatorIcon />
                </span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                aria-hidden={!selected}
                className={cn(styles.mobilePanel, selected && styles.open)}
              >
                <div className={styles.mobilePanelInner}>
                  <ServiceDetail service={service} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.desktopPanel} aria-live="polite">
        {activeService ? (
          <div className={styles.detailWrap}>
            <div className={cn(styles.glow, glowClass)} />
            <ServiceDetail service={activeService} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ServiceDetail({ service }: { service: ServiceContent }) {
  return (
    <div className={styles.detail}>
      <p className={styles.summary}>{service.summary}</p>
      {service.capabilities.length > 0 ? (
        <ul
          className={styles.chips}
          aria-label={`${service.title} capabilities`}
        >
          {service.capabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const glowClasses = [
  styles.glowClay,
  styles.glowYellow,
  styles.glowBlue,
  styles.glowClayAlt,
  styles.glowBlueAlt,
  styles.glowYellowAlt,
];

function hasFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
