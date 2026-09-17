import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps extends HTMLAttributes<HTMLElement> {}

export function H1({ className, ...props }: TypographyProps) {
    return (
        <h1
            className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl font-heading text-foreground", className)}
            {...props}
        />
    );
}

export function H2({ className, ...props }: TypographyProps) {
    return (
        <h2
            className={cn("scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 font-heading text-foreground", className)}
            {...props}
        />
    );
}

export function H3({ className, ...props }: TypographyProps) {
    return (
        <h3
            className={cn("scroll-m-20 text-2xl font-semibold tracking-tight font-heading text-foreground", className)}
            {...props}
        />
    );
}

export function P({ className, ...props }: TypographyProps) {
    return (
        <p
            className={cn("leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground", className)}
            {...props}
        />
    );
}

export function Lead({ className, ...props }: TypographyProps) {
    return (
        <p
            className={cn("text-xl text-muted-foreground", className)}
            {...props}
        />
    );
}
