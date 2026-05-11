interface Props { title: string; subtitle?: string; }
const SectionTitleTwo = ({ title, subtitle }: Props) => (
  <div className="section-title-container mb-10 text-center">
    {subtitle && <h4 className="section-title--secondary mb-4">{subtitle}</h4>}
    <h2 className="section-title">{title}</h2>
  </div>
);
export default SectionTitleTwo;
