import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmExit: () => void;
}

const ExitConfirmDialog = ({ open, onOpenChange, onConfirmExit }: ExitConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-2 border-primary/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-3xl font-bold neon-text">
            Exit Game?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg text-foreground/70">
            Are you sure you want to exit? Your current game progress will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border hover:bg-card/50">
            Resume Game
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmExit}
            className="bg-neon-pink hover:bg-neon-pink/80 text-white"
          >
            Exit to Menu
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExitConfirmDialog;
