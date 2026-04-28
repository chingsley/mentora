"use client";

import Link from "next/link";
import styled from "styled-components";
import { SiteHeader } from "@/components/layouts/SiteHeader";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const Main = styled.main`
  min-height: 100dvh;
`;

const Hero = styled.section`
  margin: 0 auto;
  max-width: 72rem;
  padding: 4rem ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    padding: 6rem ${SPACING.SIX};
  }
`;

const HeroGrid = styled.div`
  display: grid;
  gap: 2.5rem;

  ${LAYOUT.MEDIA.SM} {
    gap: 3.5rem;
  }

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: center;
  }
`;

const Title = styled.h1`
  font-size: ${FONTS.SIZE["4XL"]};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: -0.025em;
  color: ${COLORS.HEADER};

  ${LAYOUT.MEDIA.SM} {
    font-size: 3rem;
  }
`;

const Lead = styled.p`
  margin-top: 1.25rem;
  max-width: 65ch;
  font-size: ${FONTS.SIZE.BASE};
  color: rgba(2, 8, 23, 0.8);

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE.LG};
  }
`;

const CtaRow = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
  }
`;

const PrimaryCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.HEADER};
  padding: ${SPACING.THREE} ${SPACING.FIVE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.WHITE};
  text-decoration: none;

  &:hover {
    background-color: rgba(23, 32, 51, 0.9);
  }
`;

const SecondaryCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid rgba(23, 32, 51, 0.2);
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.THREE} ${SPACING.FIVE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    border-color: rgba(23, 32, 51, 0.4);
  }
`;

const Card = styled.div`
  border-radius: ${LAYOUT.RADIUS.XL};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.SIX};
  box-shadow: ${LAYOUT.SHADOW.SM};
  outline: 1px solid ${COLORS.RING_BLACK_5};
  outline-offset: -1px;

  ${LAYOUT.MEDIA.SM} {
    padding: ${SPACING.EIGHT};
  }
`;

const CardTitle = styled.h2`
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const FeatureList = styled.ul`
  margin-top: ${SPACING.FOUR};
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;

const FeatureItem = styled.li`
  display: flex;
  gap: ${SPACING.THREE};
`;

const Bullet = styled.span`
  margin-top: 0.4rem;
  display: inline-block;
  height: 0.375rem;
  width: 0.375rem;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.HEADER};
  flex-shrink: 0;
`;

const Footer = styled.footer`
  margin: 0 auto;
  max-width: 72rem;
  padding: 2.5rem ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.6);

  ${LAYOUT.MEDIA.SM} {
    padding-left: ${SPACING.SIX};
    padding-right: ${SPACING.SIX};
  }
`;

export function HomePageClient() {
  return (
    <Main>
      <SiteHeader />

      <Hero>
        <HeroGrid>
          <div>
            <Title>Learn any subject, from great teachers, on your schedule.</Title>
            <Lead>
              Mentora connects students with vetted tutors. Search by subject, pick a time
              that works for you, and join your virtual classroom in one click. Guardians get
              a read-only dashboard of progress.
            </Lead>
            <CtaRow>
              <PrimaryCta href="/register?role=STUDENT">I&apos;m a student</PrimaryCta>
              <SecondaryCta href="/register?role=TEACHER">I&apos;m a teacher</SecondaryCta>
              <SecondaryCta href="/register?role=GUARDIAN">I&apos;m a guardian</SecondaryCta>
            </CtaRow>
            <CtaRow>
              <PrimaryCta href="/">Sign up with Google</PrimaryCta>
            </CtaRow>
          </div>

          <Card>
            <CardTitle>What you get with Mentora</CardTitle>
            <FeatureList>
              <FeatureItem>
                <Bullet />
                Smart search &amp; recommendations based on your interests.
              </FeatureItem>
              <FeatureItem>
                <Bullet />
                Flexible scheduling with automatic capacity control.
              </FeatureItem>
              <FeatureItem>
                <Bullet />
                Virtual classrooms, assignments, and grades in one place.
              </FeatureItem>
              <FeatureItem>
                <Bullet />
                Guardian accounts with read-only progress visibility.
              </FeatureItem>
            </FeatureList>
          </Card>
        </HeroGrid>
      </Hero>

      <Footer>&copy; {new Date().getFullYear()} Mentora. All rights reserved.</Footer>
    </Main>
  );
}
