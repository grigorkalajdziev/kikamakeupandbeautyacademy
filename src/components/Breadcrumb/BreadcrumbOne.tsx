import { useEffect, useState, ReactNode } from "react";
interface Props { children?: ReactNode; backgroundImage?: string; pageTitle: string; className?: string; }
const BreadcrumbOne = ({ children, backgroundImage, pageTitle, className }: Props) => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div className={`breadcrumb-area ${className ?? ""}`}
      style={{ backgroundImage: backgroundImage ? `url("${backgroundImage}")` : undefined, backgroundPositionY: `${scrollY * 0.5}px`, backgroundSize: "100%", // 👈 zoom OUT (less crop)
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat", }}>
      <div className="container-wide text-center">
        <h1 className="breadcrumb__title">{pageTitle}</h1>
        {children}
      </div>
    </div>
  );
};
export default BreadcrumbOne;
