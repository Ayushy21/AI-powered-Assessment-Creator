import React from 'react';

interface DifficultyBadgeProps {
  difficulty: string;
}

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const normalized = difficulty.toLowerCase();

  let className = 'badge ';
  if (normalized === 'easy') {
    className += 'badge-easy';
  } else if (normalized === 'medium' || normalized === 'moderate') {
    className += 'badge-medium';
  } else if (normalized === 'hard' || normalized === 'difficult') {
    className += 'badge-hard';
  } else if (normalized === 'mixed') {
    className += 'badge-mixed';
  } else {
    className += 'badge-medium';
  }

  return <span className={className}>{difficulty}</span>;
}
