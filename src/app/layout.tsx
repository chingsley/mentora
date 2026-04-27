import type { Metadata, Viewport } from "next";
import { StyledComponentsRegistry } from "@/lib/registry";
import { GlobalStyles } from "@/styles/GlobalStyles";

export const metadata: Metadata = {
  title: {
    default: "Mentora — Learn with great teachers",
    template: "%s · Mentora",
  },
  description:
    "Mentora is a tutoring platform connecting students and teachers with scheduling, virtual classrooms, and learning resources.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#172033",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <GlobalStyles />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
