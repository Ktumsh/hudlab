import { IconLoader } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isSubmitting: boolean;
  loadingText: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const SubmitButton = ({
  isSubmitting,
  loadingText,
  children,
  onClick,
  className,
  ...props
}: SubmitButtonProps & React.ComponentProps<typeof Button>) => {
  return (
    <Button
      variant="primary"
      disabled={isSubmitting}
      onClick={onClick}
      className={className}
      {...props}
    >
      {isSubmitting ? (
        <>
          <IconLoader className="animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default SubmitButton;
