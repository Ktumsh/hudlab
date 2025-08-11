"use client";

import { IconChevronUp } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Markdown } from "@/components/markdown";
import { Button, buttonVariants } from "@/components/ui/button";
import { ui } from "@/config/i18n";
import useScrollToUp from "@/hooks/use-scroll-to-up";
import { cn } from "@/lib";

export interface LegalSection {
  id: string;
  title: string;
  content: string;
}

interface LegalLayoutProps {
  title: string;
  breadcrumbLabel?: string;
  lastUpdated?: string;
  sections: LegalSection[];
}

const LegalLayout = ({
  title,
  breadcrumbLabel,
  lastUpdated,
  sections,
}: LegalLayoutProps) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(120);
  const [positions, setPositions] = useState<{ id: string; top: number }[]>([]);
  const { scrollToTop } = useScrollToUp();
  // Control interno para evitar parpadeo al hacer click en el índice
  const manualScrollingRef = useRef(false);
  const manualTargetTopRef = useRef<number | null>(null);
  const manualTargetIdRef = useRef<string | null>(null);
  const manualTimeoutRef = useRef<number | null>(null);

  const computeOffset = useCallback(() => {
    const header = document.querySelector(
      'header[role="banner"], header.site-header, body > header',
    ) as HTMLElement | null;
    const h = header ? header.getBoundingClientRect().height : 0;
    return h + 56;
  }, []);

  const recomputePositions = useCallback(() => {
    const list = sections
      .map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return null;
        return { id: s.id, top: el.offsetTop };
      })
      .filter(Boolean) as { id: string; top: number }[];
    setPositions(list);
  }, [sections]);

  useEffect(() => {
    setOffset(computeOffset());
    recomputePositions();
    const onResize = () => {
      setOffset(computeOffset());
      recomputePositions();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [computeOffset, recomputePositions]);

  useEffect(() => {
    let ticking = false;
    const THRESHOLD = 2; // tolerancia píxeles para finalizar scroll manual

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rawScrollY = window.scrollY;
        const scrollYWithOffset = rawScrollY + offset + 4;

        if (manualScrollingRef.current) {
          const targetTop = manualTargetTopRef.current;
          // Si todavía no está dentro del umbral, no recalculamos activeId (evita parpadeo)
          if (
            targetTop != null &&
            Math.abs(rawScrollY - targetTop) <= THRESHOLD
          ) {
            // Llegamos al destino: fijamos activeId definitivo
            if (manualTargetIdRef.current)
              setActiveId(manualTargetIdRef.current);
            manualScrollingRef.current = false;
            manualTargetTopRef.current = null;
            manualTargetIdRef.current = null;
            if (manualTimeoutRef.current) {
              window.clearTimeout(manualTimeoutRef.current);
              manualTimeoutRef.current = null;
            }
          }
          ticking = false;
          return; // no ejecutar cálculo normal mientras se desplaza
        }

        if (!positions.length) {
          ticking = false;
          return;
        }
        // Búsqueda lineal (lista corta). Se puede optimizar a binaria si creciera.
        let current = positions[0].id;
        for (const p of positions) {
          if (scrollYWithOffset >= p.top) current = p.id;
          else break;
        }
        setActiveId((prev) => (prev === current ? prev : current));
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [positions, offset]);

  // Limpieza de timeout en desmontaje
  // Limpieza duplicada eliminada
  useEffect(
    () => () => {
      if (manualTimeoutRef.current)
        window.clearTimeout(manualTimeoutRef.current);
    },
    [],
  );

  const handleTocClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const pos = positions.find((p) => p.id === id);
      const targetTop = pos ? pos.top - offset - 4 : undefined;
      if (targetTop != null) {
        manualScrollingRef.current = true;
        manualTargetTopRef.current = targetTop;
        manualTargetIdRef.current = id;
        setActiveId(id); // feedback inmediato
        window.scrollTo({ top: targetTop, behavior: "smooth" });
        // Actualizar hash (sin duplicar historial)
        if (window.location.hash !== `#${id}`) {
          window.history.replaceState(null, "", `#${id}`);
        }
        if (manualTimeoutRef.current)
          window.clearTimeout(manualTimeoutRef.current);
        manualTimeoutRef.current = window.setTimeout(() => {
          manualScrollingRef.current = false;
          manualTargetTopRef.current = null;
          manualTargetIdRef.current = null;
        }, 1500);
      }
    },
    [positions, offset],
  );

  return (
    <main
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className="mx-auto w-full max-w-6xl px-4 pt-8 pb-40 md:pt-12"
    >
      <div className="grid gap-10 md:grid-cols-[280px_1fr]">
        <aside className="top-14 md:sticky md:h-fit md:self-start">
          <div className="mb-6 hidden md:block">
            <nav
              aria-label="Breadcrumb"
              className="text-base-content/60 mb-2 text-xs"
            >
              <ol className="flex flex-wrap items-center gap-1">
                <li>
                  <Link href="/legal" className="hover:text-base-content">
                    {ui.legal.breadcrumbRoot}
                  </Link>
                </li>
                <li aria-hidden="true">›</li>
                <li
                  aria-current="page"
                  className="text-base-content/80 font-medium"
                >
                  {breadcrumbLabel || title}
                </li>
              </ol>
            </nav>
            <h1 className="text-neutral-content mb-2 text-xl font-semibold">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-base-content/60 text-xs">
                Última actualización: {lastUpdated}
              </p>
            )}
          </div>
          <nav aria-label="Table of contents" className="hidden md:block">
            <ul className="space-y-1 text-sm">
              {sections.map((s) => {
                const isActive = activeId === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => handleTocClick(e, s.id)}
                      className={cn(
                        buttonVariants(),
                        "-mx-4.5 w-[calc(100%+18px)] justify-start border-0 bg-transparent text-left font-normal",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-base-content/70 hover:text-base-content",
                      )}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {s.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
        <div>
          <header className="mb-8 flex flex-col items-center justify-center space-y-2 md:hidden">
            <nav
              aria-label="Breadcrumb"
              className="text-base-content/60 text-xs"
            >
              <ol className="flex flex-wrap items-center gap-1">
                <li>
                  <Link href="/legal" className="hover:text-base-content">
                    {ui.legal.breadcrumbRoot}
                  </Link>
                </li>
                <li aria-hidden="true">›</li>
                <li
                  aria-current="page"
                  className="text-base-content/80 font-medium"
                >
                  {breadcrumbLabel || title}
                </li>
              </ol>
            </nav>
            <h1 className="text-neutral-content text-2xl font-semibold">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-base-content/60 text-xs">
                Última actualización: {lastUpdated}
              </p>
            )}
          </header>
          <div
            className={cn(
              "prose prose-sm md:prose max-w-none!",
              "prose-headings:text-xl prose-headings:text-base-content prose-p:text-base-content/80 prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
              "prose-strong:text-base-content prose-em:text-base-content/80",
              "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-base-200 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:text-base-content/70",
              "prose-li:marker:text-primary",
              "prose-img:rounded-lg prose-img:shadow-md prose-img:border",
            )}
          >
            {sections.map((s, index) => (
              <section
                key={s.id}
                id={s.id}
                data-legal-section
                className="scroll-mt-28"
                aria-labelledby={`${s.id}-title`}
              >
                <h2
                  id={`${s.id}-title`}
                  className={cn(
                    "text-base-content mt-8",
                    index === 0 && "mt-0!",
                  )}
                >
                  {s.title}
                </h2>
                <Markdown className="md:prose max-w-none!">
                  {s.content}
                </Markdown>
              </section>
            ))}
            <hr />
            <div className="flex items-center justify-between">
              <p className="text-base-content/60 my-0! text-xs">
                ¿Dudas? Escríbenos a{" "}
                <Link
                  href="mailto:support@hudlab.app"
                  className="text-primary hover:underline"
                >
                  support@hudlab.app
                </Link>
                .
              </p>
              <Button size="sm" onClick={scrollToTop}>
                <IconChevronUp />
                Volver arriba
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LegalLayout;
