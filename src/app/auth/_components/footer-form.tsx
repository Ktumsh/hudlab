import Link from "next/link";

interface FooterFormProps {
  label: string;
  linkText: string;
  link: string;
}

const FooterForm = ({ label, linkText, link }: FooterFormProps) => {
  return (
    <div className="z-10 flex justify-center gap-1 text-center text-sm">
      <span className="text-content-muted">{label}</span>
      <Link
        href={link}
        className="font-semibold underline-offset-4 hover:underline"
      >
        {linkText}
      </Link>
    </div>
  );
};

export default FooterForm;
