import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from '@/components/keenicons/icons';
import { useT } from '@/i18n/app/use-t';
import { passwordStrength } from './auth-schemas';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
  value?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, value, className = '', ...props }, ref) => {
    const t = useT();
    const [visible, setVisible] = useState(false);
    const strength = passwordStrength(value ?? '');

    const inputProps: Record<string, unknown> = {
      ref,
      type: visible ? 'text' : 'password',
      className: `w-full px-4 py-2.5 pr-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${className}`,
      ...props,
    };
    // Only set value when explicitly provided (controlled mode for strength display)
    if (value !== undefined) {
      inputProps.value = value;
    }

    return (
      <div className="space-y-2">
        <div className="relative">
          <input {...inputProps} />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={t(visible ? 'auth.password.hide' : 'auth.password.show')}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {showStrength && (value ?? '').length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= strength.score ? strength.color : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{t(strength.label)}</p>
          </div>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
