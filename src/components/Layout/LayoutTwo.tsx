import { Fragment, ReactNode } from "react";
import { HeaderOne } from "../Header";
import { FooterTwo } from "../Footer";
interface Props { children: ReactNode; aboutOverlay?: boolean; footerBgClass?: string; }
const LayoutTwo = ({ children, aboutOverlay, footerBgClass }: Props) => (
  <Fragment><HeaderOne aboutOverlay={aboutOverlay} /><main>{children}</main><FooterTwo footerBgClass={footerBgClass} /></Fragment>
);
export default LayoutTwo;
