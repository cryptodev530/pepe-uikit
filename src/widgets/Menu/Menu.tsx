import React, { useState, useEffect, useRef } from "react";
import styled, {DefaultTheme} from "styled-components";
import throttle from "lodash/throttle";
import Overlay from "../../components/Overlay/Overlay";
import Flex from "../../components/Box/Flex";
import { useMatchBreakpoints } from "../../hooks";
import Logo from "./components/Logo";
import Panel from "./components/Panel";
import { NavProps } from "./types";
import { MENU_HEIGHT, SUBNAV_LINK_HEIGHT, MENU_ENTRY_HEIGHT, SIDEBAR_WIDTH_REDUCED, SIDEBAR_WIDTH_FULL } from "./config";
import { LinkLabel, LinkStatus, MenuEntry } from "./components/MenuEntry";
import MenuLink from "./components/MenuLink";
import { SvgProps } from "../../components/Svg";
import * as IconModule from "./icons";
import CakePrice from "./components/CakePrice";
import SubNavPrice from "./components/SubNavPrice";
import SubNavThemeSwitcher from "./components/SubNavThemeSwitcher";
import LangSelector from "./components/LangSelector";

const Icons = IconModule as unknown as { [key: string]: React.FC<SvgProps> };

export interface Props {
  isActive?: boolean;
  theme: DefaultTheme;
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledNav = styled.nav<{ showMenu: boolean }>`
  position: fixed;
  top: ${({ showMenu }) => (showMenu ? 0 : `-${MENU_HEIGHT}px`)};
  left: 0;
  transition: top 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 8px;
  padding-right: 16px;
  width: 100%;
  height: ${MENU_HEIGHT}px;
  background-color: ${({ theme }) => theme.nav.background};
  z-index: 20;
  transform: translate3d(0, 0, 0);
`;

const BodyWrapper = styled.div`
  position: relative;
  display: flex;
`;

const Inner = styled.div<{ isPushed: boolean; showMenu: boolean }>`
  flex-grow: 1;
  margin-top: ${({ showMenu }) => (showMenu ? `${MENU_HEIGHT}px` : 0)};
  transition: margin-top 0.2s, margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translate3d(0, 0, 0);
  max-width: 100%;

  // ${({ theme }) => theme.mediaQueries.nav} {
  //   margin-left: ${({ isPushed }) => `${isPushed ? SIDEBAR_WIDTH_FULL : SIDEBAR_WIDTH_REDUCED}px`};
  //   max-width: ${({ isPushed }) => `calc(100% - ${isPushed ? SIDEBAR_WIDTH_FULL : SIDEBAR_WIDTH_REDUCED}px)`};
  // }
  ${({ theme }) => theme.mediaQueries.nav} {
    margin-left: 0;
    max-width: 100%;
  }
`;

const MobileOnlyOverlay = styled(Overlay)`
  position: fixed;
  height: 100%;

  ${({ theme }) => theme.mediaQueries.nav} {
    display: none;
  }
`;

const SubNavContainer = styled.div`
  // width: 80%;
  display: flex;
  justify-content: flex-end;
`;

const ConnectContainer = styled.div`
  display: flex;
  width: fit-content;
  align-items: center;
  justify-content: space-between;
`;

const StyledLinkContainer = styled.div`
  display: none;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  min-width: 500px;
  max-width: 900px;

  ${({ theme }) => theme.mediaQueries.md} {
    width: 100%;
    display: flex;
  }
`;

const StyledNavLink = styled.div<Props>`
  display: flex;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  text-decoration: none;
  cursor: pointer;
  align-items: center;
  height: ${SUBNAV_LINK_HEIGHT}px;
  color: ${({ isActive, theme }) => (isActive ? theme.colors.textActive : theme.colors.textSubtle)};
  box-shadow: ${({ isActive, theme }) => (isActive ? `0px 4px 0px ${theme.colors.primaryBright}` : "none")};

  &:hover {
    color: ${({ theme }) => (theme.colors.textActive)};
  }
`;

const StyledNavLinkLabel = styled.div`
  transition: color 0.4s;
  flex-grow: 1;
`;

const Menu: React.FC<NavProps> = ({
  userMenu,
  globalMenu,
  isDark,
  toggleTheme,
  langs,
  setLang,
  currentLang,
  cakePriceUsd,
  links,
  children,
}) => {
  // const { isMobile, isTablet } = useMatchBreakpoints();
  // const isSmallerScreen = isMobile || isTablet;
  const { isXl } = useMatchBreakpoints();
  const isMobile = isXl === false;
  const [isPushed, setIsPushed] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const refPrevOffset = useRef(window.pageYOffset);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;
      const isBottomOfPage = window.document.body.clientHeight === currentOffset + window.innerHeight;
      const isTopOfPage = currentOffset === 0;
      // Always show the menu when user reach the top
      if (isTopOfPage) {
        setShowMenu(true);
      }
      // Avoid triggering anything at the bottom because of layout shift
      else if (!isBottomOfPage) {
        if (currentOffset < refPrevOffset.current) {
          // Has scroll up
          setShowMenu(true);
        } else {
          // Has scroll down
          setShowMenu(false);
        }
      }
      refPrevOffset.current = currentOffset;
    };
    const throttledHandleScroll = throttle(handleScroll, 200);

    window.addEventListener("scroll", throttledHandleScroll);
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, []);

  // Find the home link if provided
  const homeLink = links.find((link) => link.label === "Home");

  // Close the menu when a user clicks a link on mobile
  const handleClick = isMobile ? () => setIsPushed(false) : undefined;

  return (
    <Wrapper>
      <StyledNav showMenu={showMenu}>
        <Logo
          isPushed={isPushed}
          togglePush={() => setIsPushed((prevState: boolean) => !prevState)}
          isDark={isDark}
          href={homeLink?.href ?? "/"}
        />
        <SubNavContainer>
          <StyledLinkContainer>
            {
              links.map(entry => {
                return (
                  <StyledNavLink key={entry.href} isActive={entry.href === location?.pathname}>
                    <MenuLink href={entry.href}>
                      <StyledNavLinkLabel>{entry.label}</StyledNavLinkLabel>
                    </MenuLink>
                  </StyledNavLink>
                )
              })
            }
          </StyledLinkContainer>
          <ConnectContainer>
            <Flex>
              <SubNavThemeSwitcher isDark={isDark} toggleTheme={toggleTheme} />
              {/* <LangSelector currentLang={currentLang} langs={langs} setLang={setLang} /> */}
            </Flex>
            <Flex>
              <SubNavPrice cakePriceUsd={cakePriceUsd} />
              {userMenu}
            </Flex>
          </ConnectContainer>
        </SubNavContainer>
      </StyledNav>
      <BodyWrapper>
        <Panel
          isPushed={isPushed}
          isMobile={isMobile}
          showMenu={showMenu}
          isDark={isDark}
          toggleTheme={toggleTheme}
          langs={langs}
          setLang={setLang}
          currentLang={currentLang}
          cakePriceUsd={cakePriceUsd}
          pushNav={setIsPushed}
          links={links}
        />
        <Inner isPushed={isPushed} showMenu={showMenu}>
          {children}
        </Inner>
        <MobileOnlyOverlay show={isPushed} onClick={() => setIsPushed(false)} role="presentation" />
      </BodyWrapper>
    </Wrapper>
  );
};

export default Menu;
