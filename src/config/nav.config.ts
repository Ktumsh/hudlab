import {
  IconHome,
  IconHomeFilled,
  IconIcons,
  IconIconsFilled,
  IconLogin2,
  IconPlus,
  IconSearch,
  IconSquareRoundedPlus,
  IconSquareRoundedPlusFilled,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";

export const navConfig = {
  mainNav: [
    {
      title: "Inicio",
      href: "/feed",
      icon: IconHome,
      iconFilled: IconHomeFilled,
    },
    {
      title: "Explorar",
      href: "/explore",
      icon: IconIcons,
      iconFilled: IconIconsFilled,
    },
    {
      title: "Crear",
      href: "/create",
      icon: IconSquareRoundedPlus,
      iconFilled: IconSquareRoundedPlusFilled,
    },
    {
      title: "Colecciones",
      href: "/collections",
      icon: IconStar,
      iconFilled: IconStarFilled,
    },
    {
      title: "Perfil",
    },
  ],
  bottomNav: [
    {
      title: "Inicio",
      href: "/feed",
      icon: IconHome,
      iconFilled: IconHomeFilled,
    },
    {
      title: "Buscar",
      icon: IconSearch,
      iconFilled: IconSearch,
    },
    {
      title: "Crear",
      href: "/create",
      icon: IconPlus,
      iconFilled: IconPlus,
    },
    {
      title: "Explorar",
      href: "/explore",
      icon: IconIcons,
      iconFilled: IconIconsFilled,
    },
    {
      title: "Perfil",
      href: "/profile",
    },
    {
      title: "Login",
      href: "/auth/login",
      icon: IconLogin2,
    },
  ],
};
