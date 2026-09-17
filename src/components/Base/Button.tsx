// @ts-nocheck
import React from 'react';
import { Button as UIButton, buttonVariants } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <UIButton
        className={className}
        variant={variant}
        size={size}
        asChild={asChild}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
