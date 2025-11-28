import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (difficulty: Difficulty) => void;
}

const cardBase = 'flex-1 min-w-[180px] max-w-xs p-6 rounded-xl border-2 cursor-pointer transition-all duration-200';

const SelectDifficultyDialog = ({ open, onOpenChange, onSelect }: Props) => {
  const [selected, setSelected] = useState<Difficulty>('medium');

  const choose = (d: Difficulty) => {
    setSelected(d);
    onSelect(d);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-xl border-2 border-cyan-500/40 rounded-lg">
        <DialogHeader className="text-center">
          <DialogTitle className="text-4xl font-bold neon-text">Select Difficulty</DialogTitle>
          <DialogDescription className="text-lg text-foreground/70 mt-2 font-medium">Choose your challenge level</DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex gap-6 justify-center items-stretch">
          {/* Easy */}
          <div
            onClick={() => choose('easy')}
            className={`${cardBase} ${selected === 'easy' ? 'border-cyan-400 shadow-neon' : 'border-border'} bg-gradient-to-br from-emerald-600/10 to-cyan-400/5`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-300 to-emerald-300 flex items-center justify-center shadow-md">
                <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-cyan-200 animate-pulse" />
              </div>
              <h3 className="text-2xl font-semibold neon-text-cyan">Easy</h3>
              <p className="text-sm text-foreground/70">Relaxed AI for beginners</p>
              <span className="mt-2 text-xs text-foreground/60">40% speed</span>
            </div>
          </div>

          {/* Medium */}
          <div
            onClick={() => choose('medium')}
            className={`${cardBase} ${selected === 'medium' ? 'border-cyan-400 shadow-neon' : 'border-border'} bg-gradient-to-br from-blue-600 to-purple-700`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center shadow-md">
                <div className="w-8 h-8 rounded-full bg-white/10" />
              </div>
              <h3 className="text-2xl font-semibold neon-text">Medium</h3>
              <p className="text-sm text-foreground/70">Balanced challenge</p>
              <span className="mt-2 text-xs text-foreground/60">65% speed</span>
            </div>
          </div>

          {/* Hard */}
          <div
            onClick={() => choose('hard')}
            className={`${cardBase} ${selected === 'hard' ? 'border-cyan-400 shadow-neon' : 'border-border'} bg-gradient-to-br from-pink-600 to-purple-800`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-violet-400 flex items-center justify-center shadow-md">
                <div className="w-8 h-8 rounded-full bg-white/10" />
              </div>
              <h3 className="text-2xl font-semibold neon-text-pink">Hard</h3>
              <p className="text-sm text-foreground/70">Intense competition</p>
              <span className="mt-2 text-xs text-foreground/60">90% speed</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 rounded-md text-sm text-cyan-300 hover:text-cyan-100"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectDifficultyDialog;
