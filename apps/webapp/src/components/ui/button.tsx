import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from '@/components/ui/icons';
import { LucideIcon } from '@/components/keenicons/icons';
import { Slot as SlotPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'cursor-pointer group whitespace-nowrap focus-visible:outline-hidden inline-flex items-center justify-center has-data-[arrow=true]:justify-between whitespace-nowrap text-sm font-medium ring-offset-background transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0 [&_i]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-[var(--primary-hover)] data-[state=open]:bg-[var(--primary-hover)] focus-visible:ring-ring',
        mono: 'bg-zinc-100 text-zinc-900 font-bold hover:bg-zinc-200 data-[state=open]:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:data-[state=open]:bg-zinc-700',
        destructive:
          'bg-[var(--color-success-soft,#fef2f2)] text-destructive font-bold hover:bg-destructive/15 data-[state=open]:bg-destructive/15 dark:bg-destructive/15 dark:text-[#f0a0a0] dark:hover:bg-destructive/25 dark:data-[state=open]:bg-destructive/25',
        secondary: 'bg-[var(--muted)] text-foreground font-bold hover:bg-brand-100 data-[state=open]:bg-brand-100 dark:hover:bg-brand-800 dark:data-[state=open]:bg-brand-800',
        outline: 'bg-background text-accent-foreground font-bold border border-input hover:bg-accent data-[state=open]:bg-accent',
        dashed:
          'text-accent-foreground font-bold border border-input border-dashed bg-background hover:bg-accent hover:text-accent-foreground data-[state=open]:text-accent-foreground',
        ghost:
          'text-accent-foreground font-bold hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        dim: 'text-muted-foreground font-bold hover:text-foreground data-[state=open]:text-foreground',
        accent:
          'bg-accent-brand-50 text-[var(--accent-brand)] font-bold hover:bg-accent-brand-100 data-[state=open]:bg-accent-brand-100 dark:bg-accent-brand-700/20 dark:text-accent-brand-300 dark:hover:bg-accent-brand-700/30 dark:data-[state=open]:bg-accent-brand-700/30',
        foreground: '',
        inverse: '',
      },
      appearance: {
        default: '',
        ghost: '',
      },
      underline: {
        solid: '',
        dashed: '',
      },
      underlined: {
        solid: '',
        dashed: '',
      },
      size: {
        lg: 'h-11 rounded-lg px-4 text-sm gap-1.5 [&_svg:not([class*=size-])]:size-4 [&_i:not([class*=size-])]:text-base',
        md: 'h-9 rounded-lg px-3 gap-1.5 text-[0.8125rem] leading-(--text-sm--line-height) [&_svg:not([class*=size-])]:size-4 [&_i:not([class*=size-])]:text-base',
        sm: 'h-7.5 rounded-lg px-2.5 gap-1.25 text-xs [&_svg:not([class*=size-])]:size-3.5 [&_i:not([class*=size-])]:text-sm',
        icon: 'size-9 rounded-lg [&_svg:not([class*=size-])]:size-4 [&_i:not([class*=size-])]:text-base shrink-0',
      },
      autoHeight: {
        true: '',
        false: '',
      },
      shape: {
        default: '',
        circle: 'rounded-full',
      },
      mode: {
        default: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        icon: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0',
        link: 'text-primary h-auto p-0 bg-transparent rounded-none hover:bg-transparent data-[state=open]:bg-transparent',
        input: `
            justify-start font-normal hover:bg-background [&_svg]:transition-colors [&_i]:transition-colors [&_svg]:hover:text-foreground [&_i]:hover:text-foreground data-[state=open]:bg-background 
            focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/30 
            [[data-state=open]>&]:border-ring [[data-state=open]>&]:outline-hidden [[data-state=open]>&]:ring-2 
            [[data-state=open]>&]:ring-ring/30 
            aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
            in-data-[invalid=true]:border-destructive/60 in-data-[invalid=true]:ring-destructive/10  dark:in-data-[invalid=true]:border-destructive dark:in-data-[invalid=true]:ring-destructive/20
          `,
      },
      placeholder: {
        true: 'text-muted-foreground',
        false: '',
      },
    },
    compoundVariants: [
      // Icons opacity for default mode
      {
        variant: 'ghost',
        mode: 'default',
        className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60',
      },
      {
        variant: 'outline',
        mode: 'default',
        className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60',
      },
      {
        variant: 'dashed',
        mode: 'default',
        className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60',
      },
      {
        variant: 'secondary',
        mode: 'default',
        className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60',
      },

      // Icons opacity for default mode
      {
        variant: 'outline',
        mode: 'input',
        className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60',
      },
      {
        variant: 'outline',
        mode: 'icon',
        className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60',
      },

      // Auto height
      {
        size: 'md',
        autoHeight: true,
        className: 'h-auto min-h-9',
      },
      {
        size: 'sm',
        autoHeight: true,
        className: 'h-auto min-h-7.5',
      },
      {
        size: 'lg',
        autoHeight: true,
        className: 'h-auto min-h-11',
      },

      // Shadow support
      {
        variant: 'primary',
        mode: 'default',
        appearance: 'default',
        className: 'shadow-none',
      },
      {
        variant: 'mono',
        mode: 'default',
        appearance: 'default',
        className: 'shadow-none',
      },
      {
        variant: 'secondary',
        mode: 'default',
        appearance: 'default',
        className: 'shadow-none',
      },
      {
        variant: 'outline',
        mode: 'default',
        appearance: 'default',
        className: 'shadow-none',
      },
      {
        variant: 'dashed',
        mode: 'default',
        appearance: 'default',
        className: 'shadow-none',
      },
      {
        variant: 'destructive',
        mode: 'default',
        appearance: 'default',
        className: 'shadow-none',
      },

      // Shadow support
      {
        variant: 'primary',
        mode: 'icon',
        appearance: 'default',
        className: 'shadow-none',
      },
      {
        variant: 'mono',
        mode: 'icon',
        appearance: 'default',
        className: 'shadow-none',
      },
      {
        variant: 'secondary',
        mode: 'icon',
        appearance: 'default',
        className: 'shadow-none',
      },
      {
        variant: 'outline',
        mode: 'icon',
        appearance: 'default',
        className: 'shadow-none',
      },
      {
        variant: 'dashed',
        mode: 'icon',
        appearance: 'default',
        className: 'shadow-none',
      },
      {
        variant: 'destructive',
        mode: 'icon',
        appearance: 'default',
        className: 'shadow-none',
      },

      // Link
      {
        variant: 'primary',
        mode: 'link',
        underline: 'solid',
        className:
          'font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid',
      },
      {
        variant: 'primary',
        mode: 'link',
        underline: 'dashed',
        className:
          'font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1',
      },
      {
        variant: 'primary',
        mode: 'link',
        underlined: 'solid',
        className:
          'font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid',
      },
      {
        variant: 'primary',
        mode: 'link',
        underlined: 'dashed',
        className:
          'font-medium text-primary hover:text-primary/90 [&_svg]:opacity-60 [&_i]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1',
      },

      {
        variant: 'inverse',
        mode: 'link',
        underline: 'solid',
        className:
          'font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid',
      },
      {
        variant: 'inverse',
        mode: 'link',
        underline: 'dashed',
        className:
          'font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1',
      },
      {
        variant: 'inverse',
        mode: 'link',
        underlined: 'solid',
        className:
          'font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid',
      },
      {
        variant: 'inverse',
        mode: 'link',
        underlined: 'dashed',
        className:
          'font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1',
      },

      {
        variant: 'foreground',
        mode: 'link',
        underline: 'solid',
        className:
          'font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid',
      },
      {
        variant: 'foreground',
        mode: 'link',
        underline: 'dashed',
        className:
          'font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1',
      },
      {
        variant: 'foreground',
        mode: 'link',
        underlined: 'solid',
        className:
          'font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid',
      },
      {
        variant: 'foreground',
        mode: 'link',
        underlined: 'dashed',
        className:
          'font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1',
      },

      // Ghost
      {
        variant: 'primary',
        appearance: 'ghost',
        className: 'bg-transparent text-primary hover:bg-brand-50 data-[state=open]:bg-brand-50',
      },
      {
        variant: 'destructive',
        appearance: 'ghost',
        className: 'bg-transparent text-destructive hover:bg-destructive/5 data-[state=open]:bg-destructive/5',
      },
      {
        variant: 'ghost',
        mode: 'icon',
        className: 'text-muted-foreground',
      },

      // Size
      {
        size: 'sm',
        mode: 'icon',
        className: 'w-7.5 h-7.5 p-0 [[&_svg:not([class*=size-])]:size-3.5 [&_i:not([class*=size-])]:text-sm',
      },
      {
        size: 'md',
        mode: 'icon',
        className: 'w-9 h-9 p-0 [&_svg:not([class*=size-])]:size-4 [&_i:not([class*=size-])]:text-base',
      },
      {
        size: 'icon',
        className: 'w-9 h-9 p-0 [&_svg:not([class*=size-])]:size-4 [&_i:not([class*=size-])]:text-base',
      },
      {
        size: 'lg',
        mode: 'icon',
        className: 'w-11 h-11 p-0 [&_svg:not([class*=size-])]:size-4 [&_i:not([class*=size-])]:text-base',
      },

      // Input mode
      {
        mode: 'input',
        placeholder: true,
        variant: 'outline',
        className: 'font-normal text-muted-foreground',
      },
      {
        mode: 'input',
        variant: 'outline',
        size: 'sm',
        className: 'gap-1.25',
      },
      {
        mode: 'input',
        variant: 'outline',
        size: 'md',
        className: 'gap-1.5',
      },
      {
        mode: 'input',
        variant: 'outline',
        size: 'lg',
        className: 'gap-1.5',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      mode: 'default',
      size: 'md',
      shape: 'default',
      appearance: 'default',
    },
  },
);

function Button({
  className,
  selected,
  variant,
  shape,
  appearance,
  mode,
  size,
  autoHeight,
  underlined,
  underline,
  asChild = false,
  placeholder = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    selected?: boolean;
    asChild?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          shape,
          appearance,
          mode,
          autoHeight,
          placeholder,
          underlined,
          underline,
          className,
        }),
        asChild && props.disabled && 'pointer-events-none opacity-50',
      )}
      {...(selected && { 'data-state': 'open' })}
      {...props}
    />
  );
}

interface ButtonArrowProps extends React.SVGProps<SVGSVGElement> {
  icon?: LucideIcon; // Allows passing any Lucide icon
}

function ButtonArrow({ icon: Icon = ChevronDown, className, ...props }: ButtonArrowProps) {
  return <Icon data-slot="button-arrow" className={cn('ms-auto -me-1', className)} {...props} />;
}

export { Button, ButtonArrow, buttonVariants };
