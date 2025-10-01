import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SECTIONS = ["home","game","projects","stack","contact"] as const;
type SectionId = typeof SECTIONS[number];

const Navbar = () => {
  const [active, setActive] = useState<SectionId>("home");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`h-full flex flex-col items-center py-5 fixed top-0 z-20 ${
        scrolled ? "bg-yellow-300" : "bg-transparent"
      }`}
    >
      <div>
        <Link
          to='/'
          className='flex items-center gap-2'
          onClick={() => {
            setActive("home");
            window.scrollTo(0, 0);
          }}
        >
          <p className='text-white text-[18px] font-bold cursor-pointer flex '>
            Amir Reza&nbsp;
            <span className='sm:block hidden'>Azemati</span>
          </p>
        </Link>

        {/* دسکتاپ */}
        <ul className='pt-10 list-none hidden sm:flex flex-col gap-10'>
          {SECTIONS.map((id) => (
            <li
              key={id}
              className={`${
                active === id ? "text-white" : "text-blue-400"
              } hover:text-white text-[18px] font-medium cursor-pointer`}
              onClick={() => setActive(id)}
            >
              <a href={`#${id}`}>{id}</a>
            </li>
          ))}
        </ul>

        {/* موبایل */}
        <div className='sm:hidden flex flex-1 justify-end items-center'>
          {/* <img
            src={toggle ? close : menu}
            alt='menu'
            className='w-[28px] h-[28px] object-contain'
            onClick={() => setToggle(!toggle)}
          /> */}

          <div
            className={`${
              !toggle ? "hidden" : "flex"
            } p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl`}
          >
            <ul className='list-none flex justify-end items-start flex-1 flex-col gap-4'>
              {SECTIONS.map((id) => (
                <li
                  key={id}
                  className={`font-poppins font-medium cursor-pointer text-[16px] ${
                    active === id ? "text-white" : "text-amber-800"
                  }`}
                  onClick={() => {
                    setToggle(false);
                    setActive(id);
                  }}
                >
                  <a href={`#${id}`}>{id}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
