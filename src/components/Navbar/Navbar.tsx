import useSectionNav from "./hooks/useSectionNav";
import NavbarUI from "./NavbarUI";
import FakeScroll from "./FakeScroll";

/** Mount this; it wires logic (hook) to the presentational UI */
export default function Navbar() {
  const { active, scrollTo } = useSectionNav("home");
  return (
  <>
    <NavbarUI 
            active={active}
            scrollTo={scrollTo}
          />
  </>
  );
}
