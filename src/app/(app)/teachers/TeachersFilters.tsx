"use client";

import type { DayOfWeek } from "@prisma/client";
import { ChevronDown, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_SIZE, ICON_STROKE, ICON_THEME } from "@/constants/iconTheme.constants";
import { BOX_SHADOW_INPUTS, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { DAY_LABEL, DAY_ORDER } from "@/lib/time";

const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  margin-bottom: ${SPACING.FIVE};
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: ${SPACING.TWO};
  width: 100%;
  min-height: ${FORM_FIELD.CONTROL_MIN_HEIGHT};
  padding: 0 ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  box-shadow: ${BOX_SHADOW_INPUTS};
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:focus-within {
    border-color: ${COLORS.ACTION_PRIMARY_BORDER_25};
    box-shadow: ${COLORS.ACTION_PRIMARY_SHADOW_MD};
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.TEXT};
  outline: none;

  &::placeholder {
    color: ${COLORS.INPUT_PLACEHOLDER};
  }
`;

const SearchSubmit = styled.button`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: ${COLORS.ACTION_PRIMARY};
  cursor: pointer;
  padding: 0;

  &:hover {
    color: ${COLORS.ACTION_PRIMARY_HOVER};
  }
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const ChipWrap = styled.div`
  position: relative;
`;

const chipActiveStyles = css`
  border-color: ${COLORS.ACTION_PRIMARY_BORDER_25};
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  color: ${COLORS.ACTION_PRIMARY};
`;

const ChipButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
  max-width: 100%;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.ONE} ${SPACING.THREE};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.HEADER};
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  ${(p) => p.$active && chipActiveStyles}

  &:hover {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
    border-color: ${COLORS.SURFACE_NEUTRAL_BORDER_HOVER};
  }

  ${(p) =>
    p.$active &&
    css`
      &:hover {
        background-color: ${COLORS.ACTION_PRIMARY_TINT_16};
        border-color: ${COLORS.ACTION_PRIMARY_BORDER_25};
      }
    `}
`;

const ChipLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + ${SPACING.ONE});
  left: 0;
  z-index: ${LAYOUT.Z.STICKY};
  min-width: 12rem;
  max-width: min(20rem, calc(100vw - ${SPACING.EIGHT}));
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  box-shadow: ${LAYOUT.SHADOW.LG};
  padding: ${SPACING.TWO};
`;

const PanelList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const PanelOption = styled.button<{ $selected: boolean }>`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border: none;
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${(p) => (p.$selected ? COLORS.ACTION_PRIMARY_TINT_10 : COLORS.TRANSPARENT)};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  text-align: left;
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${(p) => (p.$selected ? FONTS.WEIGHT.MEDIUM : FONTS.WEIGHT.NORMAL)};
  color: ${(p) => (p.$selected ? COLORS.ACTION_PRIMARY : COLORS.HEADER)};
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
  }
`;

const DayGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.ONE};
`;

const DayChip = styled.button<{ $selected: boolean }>`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${(p) => (p.$selected ? COLORS.ACTION_PRIMARY_TINT_10 : COLORS.FOREGROUND)};
  padding: ${SPACING.ONE} ${SPACING.TWO};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${(p) => (p.$selected ? COLORS.ACTION_PRIMARY : COLORS.HEADER)};
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
  }
`;

const PriceField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  padding: ${SPACING.ONE};
`;

const PriceLabel = styled.span`
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const PriceInput = styled.input`
  height: ${FORM_FIELD.CONTROL_MIN_HEIGHT};
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${FORM_FIELD.CONTROL_PADDING_INLINE};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};
  outline: none;

  &:focus {
    border-color: ${COLORS.ACTION_PRIMARY_BORDER_25};
  }
`;

const PriceApply = styled.button`
  align-self: flex-start;
  border: none;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.ACTION_PRIMARY};
  padding: ${SPACING.ONE} ${SPACING.FOUR};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.WHITE};
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.ACTION_PRIMARY_HOVER};
  }
`;

const ClearLink = styled(Link)`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.ACTION_PRIMARY};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

type MenuId = "subject" | "region" | "max" | "rating" | "day";

export interface TeachersFiltersProps {
  q?: string;
  subject?: string;
  region?: string;
  max?: string;
  day?: string;
  rating?: string;
  subjects: Array<{ id: string; slug: string; name: string }>;
  regions: Array<{ id: string; code: string; name: string; currency: string }>;
  maxRegion: { currency: string } | undefined;
}

function buildTeachersHref(values: {
  q?: string;
  subject?: string;
  region?: string;
  max?: string;
  day?: string;
  rating?: string;
}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value != null && String(value).trim() !== "") params.set(key, String(value).trim());
  }
  const qs = params.toString();
  return qs ? `/teachers?${qs}` : "/teachers";
}

export function TeachersFilters({
  q,
  subject,
  region,
  max,
  day,
  rating,
  subjects,
  regions,
  maxRegion,
}: TeachersFiltersProps) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = React.useState<MenuId | null>(null);
  const [searchDraft, setSearchDraft] = React.useState(q ?? "");
  const [maxDraft, setMaxDraft] = React.useState(max ?? "");
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSearchDraft(q ?? "");
  }, [q]);

  React.useEffect(() => {
    setMaxDraft(max ?? "");
  }, [max]);

  React.useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!toolbarRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const currency = maxRegion?.currency ?? "USD";
  const subjectName = subjects.find((s) => s.slug === subject)?.name;
  const regionName = regions.find((r) => r.code === region)?.name;
  const ratingLabel =
    rating === "4.5" ? "4.5+ stars" : rating === "4" ? "4+ stars" : rating === "3" ? "3+ stars" : null;
  const dayLabel = day ? DAY_LABEL[day as DayOfWeek] : null;

  const hasActiveFilters = Boolean(q || subject || region || max || day || rating);

  function navigate(
    patch: Partial<{
      q?: string;
      subject?: string;
      region?: string;
      max?: string;
      day?: string;
      rating?: string;
    }>,
  ) {
    router.push(
      buildTeachersHref({
        q,
        subject,
        region,
        max,
        day,
        rating,
        ...patch,
      }),
    );
    setOpenMenu(null);
  }

  function toggleMenu(id: MenuId) {
    setOpenMenu((current) => (current === id ? null : id));
  }

  function onSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    navigate({ q: searchDraft.trim() || undefined });
  }

  function clearSearch() {
    setSearchDraft("");
    navigate({ q: undefined });
  }

  return (
    <Toolbar ref={toolbarRef}>
      <SearchForm onSubmit={onSearchSubmit} role="search" aria-label="Search teachers">
        <Search
          size={ICON_SIZE.SM}
          strokeWidth={ICON_STROKE.NORMAL}
          color={COLORS.MUTED_FOREGROUND}
          aria-hidden
        />
        <SearchInput
          name="q"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Search by name, teacher ID, or subject"
          aria-label="Search teachers"
        />
        {searchDraft ? (
          <SearchSubmit type="button" onClick={clearSearch} aria-label="Clear search">
            <X size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.NORMAL} />
          </SearchSubmit>
        ) : null}
        <SearchSubmit type="submit" aria-label="Search">
          <Search size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.MEDIUM} />
        </SearchSubmit>
      </SearchForm>

      <ChipRow role="group" aria-label="Filter teachers">
        <FilterChip
          label="Subject"
          summary={subjectName}
          active={Boolean(subject)}
          open={openMenu === "subject"}
          onToggle={() => toggleMenu("subject")}
        >
          <PanelList>
            <li>
              <PanelOption $selected={!subject} onClick={() => navigate({ subject: undefined })}>
                Any subject
              </PanelOption>
            </li>
            {subjects.map((s) => (
              <li key={s.id}>
                <PanelOption
                  $selected={subject === s.slug}
                  onClick={() => navigate({ subject: s.slug })}
                >
                  {s.name}
                </PanelOption>
              </li>
            ))}
          </PanelList>
        </FilterChip>

        <FilterChip
          label="Region"
          summary={regionName}
          active={Boolean(region)}
          open={openMenu === "region"}
          onToggle={() => toggleMenu("region")}
        >
          <PanelList>
            <li>
              <PanelOption $selected={!region} onClick={() => navigate({ region: undefined })}>
                Any region
              </PanelOption>
            </li>
            {regions.map((r) => (
              <li key={r.id}>
                <PanelOption
                  $selected={region === r.code}
                  onClick={() => navigate({ region: r.code, max: undefined })}
                >
                  {r.name}
                </PanelOption>
              </li>
            ))}
          </PanelList>
        </FilterChip>

        <FilterChip
          label="Max price"
          summary={max ? `≤ ${max} ${currency}` : undefined}
          active={Boolean(max)}
          open={openMenu === "max"}
          onToggle={() => toggleMenu("max")}
        >
          <PriceField>
            <PriceLabel>Max hourly rate ({currency})</PriceLabel>
            <PriceInput
              value={maxDraft}
              onChange={(event) => setMaxDraft(event.target.value)}
              placeholder={currency === "NGN" ? "5000" : "25"}
              inputMode="decimal"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  navigate({ max: maxDraft.trim() || undefined });
                }
              }}
            />
            <PriceApply type="button" onClick={() => navigate({ max: maxDraft.trim() || undefined })}>
              Apply
            </PriceApply>
          </PriceField>
        </FilterChip>

        <FilterChip
          label="Rating"
          summary={ratingLabel ?? undefined}
          active={Boolean(rating)}
          open={openMenu === "rating"}
          onToggle={() => toggleMenu("rating")}
        >
          <PanelList>
            {[
              { value: undefined, label: "Any rating" },
              { value: "3", label: "3+ stars" },
              { value: "4", label: "4+ stars" },
              { value: "4.5", label: "4.5+ stars" },
            ].map((option) => (
              <li key={option.label}>
                <PanelOption
                  $selected={(rating ?? "") === (option.value ?? "")}
                  onClick={() => navigate({ rating: option.value })}
                >
                  {option.label}
                </PanelOption>
              </li>
            ))}
          </PanelList>
        </FilterChip>

        <FilterChip
          label="Day"
          summary={dayLabel ?? undefined}
          active={Boolean(day)}
          open={openMenu === "day"}
          onToggle={() => toggleMenu("day")}
        >
          <DayGrid>
            <DayChip $selected={!day} onClick={() => navigate({ day: undefined })}>
              Any
            </DayChip>
            {DAY_ORDER.map((d) => (
              <DayChip key={d} $selected={day === d} onClick={() => navigate({ day: d })}>
                {DAY_LABEL[d].slice(0, 3)}
              </DayChip>
            ))}
          </DayGrid>
        </FilterChip>

        {hasActiveFilters ? <ClearLink href="/teachers">Clear filters</ClearLink> : null}
      </ChipRow>
    </Toolbar>
  );
}

interface FilterChipProps {
  label: string;
  summary?: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterChip({ label, summary, active, open, onToggle, children }: FilterChipProps) {
  return (
    <ChipWrap>
      <ChipButton
        type="button"
        $active={active}
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <ChipLabel>{summary ?? label}</ChipLabel>
        <ChevronDown
          size={ICON_SIZE.XS}
          strokeWidth={ICON_STROKE.MEDIUM}
          color={active ? ICON_THEME.MAJE_BRAND : COLORS.MUTED_FOREGROUND}
          aria-hidden
        />
      </ChipButton>
      {open ? <Panel role="listbox">{children}</Panel> : null}
    </ChipWrap>
  );
}
