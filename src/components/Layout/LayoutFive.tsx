import { Fragment, ReactNode } from "react";
import { HeaderFive } from "../Header";
import { FooterTwo } from "../Footer";
const LayoutFive = ({ children }: { children: ReactNode }) => (
  <Fragment><HeaderFive /><main>{children}</main><FooterTwo /></Fragment>
);
export default LayoutFive;
