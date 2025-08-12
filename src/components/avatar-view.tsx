import { Avatar, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface AvatarViewProps {
  children: React.ReactNode;
  avatar: string;
  displayName: string;
}

const AvatarView = ({ children, avatar, displayName }: AvatarViewProps) => {
  const displayText = `Avatar de ${displayName}`;
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        disableStopPropagation
        className="w-fit rounded-full border-0 bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">{displayText}</DialogTitle>
        <DialogDescription className="sr-only">{displayText}</DialogDescription>
        <Avatar className="size-60">
          <AvatarImage src={avatar} alt={displayText} />
        </Avatar>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarView;
