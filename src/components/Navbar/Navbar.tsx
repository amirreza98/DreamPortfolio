import useSectionNav from "./hooks/useSectionNav";
import NavbarUI from "./NavbarUI";

/** Mount this; it wires logic ط(hook) to the presentational UI */
export default function Navbar() {
  const nav = useSectionNav();
  return (
  <>
    <NavbarUI
      active={nav.active}
      onSelect={nav.scrollTo}
      offsetY={nav.offsetY}
    />
  </>
  );
}
