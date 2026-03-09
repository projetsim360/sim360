import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DisabledWithTooltipProps {
  disabled: boolean;
  reason?: string;
  children: React.ReactElement;
}

function DisabledWithTooltip({ disabled, reason, children }: DisabledWithTooltipProps) {
  if (!disabled || !reason) {
    return children;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          {React.cloneElement(children, {
            ...children.props,
            className: cn(children.props.className, 'pointer-events-none opacity-50'),
            disabled: true,
            'aria-disabled': true,
            tabIndex: -1,
          })}
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}

export { DisabledWithTooltip, type DisabledWithTooltipProps };
