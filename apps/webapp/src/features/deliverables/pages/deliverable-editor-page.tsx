import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  useDeliverable,
  useSaveContent,
  useSubmitDeliverable,
  useDeliverableTemplate,
} from '../api/deliverables.api';
import { DeliverableStatusBadge } from '../components/deliverable-status-badge';
import { MarkdownPreview } from '../components/markdown-preview';
import { RichTextEditor } from '../components/rich-text-editor';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DeliverableEditorPage() {
  const { id, delId } = useParams<{ id: string; delId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const contentChangedRef = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    data: deliverable,
    isLoading,
    error,
  } = useDeliverable(id || '', delId || '');
  const saveContentMutation = useSaveContent(id || '', delId || '');
  const submitMutation = useSubmitDeliverable(id || '');
  const { data: template, isLoading: isLoadingTemplate } =
    useDeliverableTemplate(id || '', delId || '', showTemplate);

  // Init content from deliverable
  useEffect(() => {
    if (deliverable?.content !== undefined) {
      setContent(deliverable.content || '');
      if (deliverable.lastSavedAt) {
        setLastSaved(new Date(deliverable.lastSavedAt));
      }
    }
  }, [deliverable]);

  // Auto-save every 30 seconds
  const handleSave = useCallback(async () => {
    if (!id || !delId || !contentChangedRef.current) return;
    setIsSaving(true);
    try {
      await saveContentMutation.mutateAsync(content);
      setLastSaved(new Date());
      contentChangedRef.current = false;
    } catch {
      toast.error('Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  }, [id, delId, content, saveContentMutation]);

  useEffect(() => {
    autoSaveTimerRef.current = setInterval(() => {
      if (contentChangedRef.current) {
        handleSave();
      }
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [handleSave]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (contentChangedRef.current && id && delId) {
        // Fire and forget
        saveContentMutation.mutate(content);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleContentChange(value: string) {
    setContent(value);
    contentChangedRef.current = true;
  }

  async function handleSubmit() {
    if (!id || !delId) return;
    try {
      // Save first if needed
      if (contentChangedRef.current) {
        await saveContentMutation.mutateAsync(content);
        contentChangedRef.current = false;
      }
      await submitMutation.mutateAsync(delId);
      toast.success('Livrable soumis pour evaluation.');
      navigate(`/simulations/${id}/deliverables`);
    } catch (err) {
      toast.error(
        (err as Error).message || 'Erreur lors de la soumission.',
      );
    }
  }

  if (isLoading) {
    return (
      <div className="container">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error || !deliverable) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Editeur de livrable" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">
              {(error as Error)?.message || 'Livrable introuvable.'}
            </p>
            <Button variant="link" asChild className="mt-2">
              <Link to={id ? `/simulations/${id}/deliverables` : '/simulations'}>
                Retour aux livrables
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isReadOnly =
    deliverable.status === 'SUBMITTED' ||
    deliverable.status === 'VALIDATED' ||
    deliverable.status === 'REJECTED';

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={deliverable.title} />
        <ToolbarActions>
          <DeliverableStatusBadge status={deliverable.status} />

          {/* Save indicator */}
          <span className="text-xs text-muted-foreground">
            {isSaving ? (
              <>
                <KeenIcon
                  icon="loading"
                  style="outline"
                  className="size-3 inline animate-spin"
                />{' '}
                Sauvegarde...
              </>
            ) : lastSaved ? (
              <>
                Sauvegarde{' '}
                {formatDistanceToNow(lastSaved, {
                  addSuffix: true,
                  locale: fr,
                })}
              </>
            ) : null}
          </span>

          {/* Manual save */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isReadOnly}
          >
            <KeenIcon icon="disk" style="outline" className="size-4" />
            Sauvegarder
          </Button>

          {/* Template toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplate(!showTemplate)}
          >
            <KeenIcon icon="book" style="outline" className="size-4" />
            {showTemplate ? 'Masquer template' : 'Voir template'}
          </Button>

          {/* Submit */}
          {!isReadOnly && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={!content.trim()}>
                  <KeenIcon icon="send" style="outline" className="size-4" />
                  Soumettre
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Soumettre pour evaluation ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Votre livrable sera evalue par l'IA. Vous ne pourrez plus le
                    modifier tant que l'evaluation n'est pas terminee.
                    {deliverable.revisionNumber > 0 && (
                      <>
                        <br />
                        <br />
                        Il s'agit de votre revision{' '}
                        {deliverable.revisionNumber}/{deliverable.maxRevisions}.
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>
                    Confirmer la soumission
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/deliverables`}>
              <KeenIcon icon="arrow-left" style="outline" className="size-4" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

        <div className={showTemplate ? 'grid grid-cols-1 lg:grid-cols-3 gap-4' : ''}>
          {/* WYSIWYG Editor */}
          <Card className={showTemplate ? 'lg:col-span-2' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Editeur</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <RichTextEditor
                content={content}
                onChange={handleContentChange}
                disabled={isReadOnly}
                placeholder="Redigez votre livrable ici..."
              />
            </CardContent>
          </Card>

          {/* Template side panel */}
          {showTemplate && template ? (
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-primary">
                    Template : {template.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(template.content).then(() => {
                        toast('Template copie !');
                      }).catch(() => {
                        toast.error('Impossible de copier le template.');
                      });
                    }}
                  >
                    <KeenIcon icon="copy" style="outline" className="size-3 mr-1" />
                    Copier le template
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto border-t border-border">
                  <MarkdownPreview content={template.content} />
                  {template.pmiProcess && (
                    <div className="px-4 pb-4 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">Processus PMI :</span>{' '}
                        {template.pmiProcess}
                      </p>
                    </div>
                  )}
                </div>
                {template.evaluationCriteria && Object.keys(template.evaluationCriteria).length > 0 && (
                  <div className="px-4 pb-4 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-foreground mb-2">
                      Criteres d'evaluation :
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(template.evaluationCriteria).map(([key, value]) => (
                        <Badge
                          key={key}
                          variant="info"
                          appearance="light"
                          size="xs"
                        >
                          <KeenIcon icon="check-circle" style="outline" className="size-3 mr-1" />
                          {typeof value === 'string' ? value : key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : showTemplate && isLoadingTemplate ? (
            <Card>
              <CardContent className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Deliverable info */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span>Phase {deliverable.phaseOrder}</span>
          <span>
            Revision {deliverable.revisionNumber}/{deliverable.maxRevisions}
          </span>
          {deliverable.dueDate && (
            <span>
              Echeance :{' '}
              {new Date(deliverable.dueDate).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
