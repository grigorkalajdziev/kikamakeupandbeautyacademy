interface Props { title: string; subtitle?: string; }
const SectionTitleOne = ({ title, subtitle }: Props) => (
  <div className="section-title-container mb-10 text-center">
    <h2 className={`section-title ${subtitle ? "mb-4" : ""}`}>{title}</h2>
    {subtitle && <h4 className="section-title--secondary">{subtitle}</h4>}
  </div>
);
export default SectionTitleOne;
