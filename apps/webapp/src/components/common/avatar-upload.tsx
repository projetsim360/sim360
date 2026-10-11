import { useState, useRef, useCallback } from 'react';
import { Upload, X, User } from '@/components/keenicons/icons';
import { api } from '@/lib/api-client';
import { resolveAssetUrl } from '@/lib/asset-url';
import { toast } from 'sonner';
import { useT } from '@/i18n/app/use-t';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  firstName?: string;
  lastName?: string;
  onUpload?: (avatarUrl: string) => void;
  onDelete?: () => void;
}

export function AvatarUpload({
  currentAvatar,
  firstName = '',
  lastName = '',
  onUpload,
  onDelete,
}: AvatarUploadProps) {
  const t = useT();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  const avatarSrc = resolveAssetUrl(currentAvatar);
  const displayUrl = preview || avatarSrc;

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('avatar.tooBig'));
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(t('avatar.formats'));
        return;
      }

      // Preview
      const url = URL.createObjectURL(file);
      setPreview(url);

      // Upload
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const result = await api.upload<{ avatar: string }>('/users/me/avatar', formData);
        onUpload?.(result.avatar);
        // Drop the local preview so the image shown is the one actually served.
        setPreview(null);
        toast.success(t('avatar.updated'));
      } catch {
        setPreview(null);
        toast.error(t('avatar.uploadError'));
      } finally {
        URL.revokeObjectURL(url);
        setUploading(false);
      }
    },
    [onUpload, t],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDelete = async () => {
    try {
      await api.delete('/users/me/avatar');
      setPreview(null);
      onDelete?.();
    } catch {
      toast.error(t('avatar.deleteError'));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative w-32 h-32 rounded-full overflow-hidden border-2 transition-colors cursor-pointer ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : initials ? (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
            <span className="text-3xl font-semibold text-primary">{initials}</span>
          </div>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
          <Upload className="h-6 w-6 text-white" />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-sm text-primary hover:underline"
        >
          {t('avatar.change')}
        </button>
        {(displayUrl || currentAvatar) && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm text-destructive hover:underline"
          >
            {t('settings.deleteBtn')}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{t('avatar.hint')}</p>
    </div>
  );
}
