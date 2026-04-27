"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

/**
 * styled-components SSR registry for the Next.js App Router.
 *
 * Renders styles into the streamed HTML using `useServerInsertedHTML`, then
 * lets styled-components take over on the client. Mount this at the root of the
 * App Router so server components can use styled-component children safely.
 *
 * https://nextjs.org/docs/app/building-your-application/styling/css-in-js#styled-components
 */
export function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [styledComponentsStyleSheet] = React.useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children as React.ReactElement}
    </StyleSheetManager>
  );
}
