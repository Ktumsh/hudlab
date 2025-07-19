import { IconCircleX } from "@tabler/icons-react";

interface ErrorMessageProps {
  error: string | null;
}

const ErrorMessage = ({ error }: ErrorMessageProps) => {
  return (
    error && (
      <div role="alert" className="alert alert-error">
        <IconCircleX />
        <span>{error}</span>
      </div>
    )
  );
};

export default ErrorMessage;
