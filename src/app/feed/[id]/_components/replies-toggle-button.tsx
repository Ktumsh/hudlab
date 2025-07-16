interface RepliesToggleButtonProps {
  expanded: boolean;
  count: number;
  onClick: () => void;
}

const RepliesToggleButton = ({
  expanded,
  count,
  onClick,
}: RepliesToggleButtonProps) => {
  return (
    <button
      className="text-xxs mb-4 flex items-center gap-2 md:text-xs"
      onClick={onClick}
    >
      <span className="bg-border h-0.5 w-5 flex-1" />
      {expanded ? "Ocultar respuestas" : `Ver ${count} respuestas`}
    </button>
  );
};

export default RepliesToggleButton;
