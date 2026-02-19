import { useState, useRef, useCallback } from 'react';
import { Upload, X, User } from 'lucide-react';
import { api } from '@/lib/api-client';

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
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  const displayUrl = preview || currentAvatar;

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille maximum est de 5 Mo');
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Formats acceptés : JPG, PNG, WebP');
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
      } catch {
        setPreview(null);
        alert("Erreur lors de l'upload");
      } finally {
        setUploading(false);
      }
    },
    [onUpload],
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
      alert("Erreur lors de la suppression");
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
          Changer la photo
        </button>
        {(displayUrl || currentAvatar) && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm text-destructive hover:underline"
          >
            Supprimer
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">JPG, PNG ou WebP. Max 5 Mo.</p>
    </div>
  );
}
