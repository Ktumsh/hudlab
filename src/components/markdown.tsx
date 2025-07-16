import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib";

interface MarkdownProps {
  children: string;
  className?: string;
}

const components: Partial<Components> = {
  p({ children }) {
    return <p className="mb-2 last:mb-0">{children}</p>;
  },
  h3({ children }) {
    return <h3 className="mt-4">{children}</h3>;
  },
};

export const Markdown = ({ children, className }: MarkdownProps) => {
  const remarkPlugins = [remarkGfm];

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        "prose-headings:text-base-content prose-p:text-base-content/80 prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
        "prose-strong:text-base-content prose-em:text-base-content/80",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-base-200 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:text-base-content/70",
        "prose-li:marker:text-primary",
        "prose-img:rounded-lg prose-img:shadow-md prose-img:border",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
};
