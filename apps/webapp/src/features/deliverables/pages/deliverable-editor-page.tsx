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
import { DisabledWithTooltip } from '@/components/ui/disabled-with-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { ContextualHelp } from '@/components/ui/contextual-help';
import { toast } from 'sonner';
import {
  useDeliverable,
  useSaveContent,
  useSubmitDeliverable,
  useDeliverableTemplate,
} from '../api/deliverables.api';
import { DeliverableStatusBadge } from '../components/deliverable-status-badge';
import { DeliverableWorkflowStepper } from '../components/deliverable-workflow-stepper';
import { MarkdownPreview } from '../components/markdown-preview';
import { RichTextEditor } from '../components/rich-text-editor';
import { formatDistanceToNow } from 'date-fns';
import { enCA, fr } from 'date-fns/locale';
import { useAppLocale } from '@/providers/locale-provider';
import { useT } from '@/i18n/app/use-t';

export default function DeliverableEditorPage() {
  const { locale, intlLocale } = useAppLocale();
  const dfLocale = locale === 'en' ? enCA : fr;
  const t = useT();
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
      toast.error(t('editor.saveError'));
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
      toast.success(t('editor.submitted'));
      navigate(`/simulations/${id}/deliverables`);
    } catch (err) {
      toast.error(
        (err as Error).message || t('editor.submitError'),
      );
    }
  }

  if (isLoading) {
    return (
      <div className="container">
        <Skeleton className="h-10 w-64 mb-5" />
        <Skeleton className="h-12 rounded-lg mb-5" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (error || !deliverable) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={t('editor.title')} />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">
              {(error as Error)?.message || t('editor.notFound')}
            </p>
            <Button mode="link" asChild className="mt-2">
              <Link to={id ? `/simulations/${id}/deliverables` : '/simulations'}>
                {t('editor.backToList')}
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
          <span className="text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <KeenIcon
                  icon="loading"
                  style="duotone"
                  className="size-3 inline animate-spin"
                />{' '}
                {t('editor.saving')}
              </>
            ) : lastSaved ? (
              <>
                {t('editor.saved')}{' '}
                {formatDistanceToNow(lastSaved, {
                  addSuffix: true,
                  locale: dfLocale,
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
            <KeenIcon icon="disk" style="duotone" className="size-4" />
            {t('common.save')}
          </Button>

          {/* Template toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplate(!showTemplate)}
          >
            <KeenIcon icon="book" style="duotone" className="size-4" />
            {showTemplate ? t('editor.hideTemplate') : t('editor.showTemplate')}
          </Button>

          {/* Submit */}
          {!isReadOnly && (
            <DisabledWithTooltip disabled={!content.trim()} reason={t('editor.writeFirst')}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={!content.trim()}>
                  <KeenIcon icon="send" style="duotone" className="size-4" />
                  {t('common.submit')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('editor.confirmTitle')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('editor.confirmText')}
                    {deliverable.revisionNumber > 0 && (
                      <>
                        <br />
                        <br />
                        {t('editor.revisionNote', { n: deliverable.revisionNumber, max: deliverable.maxRevisions })}
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>
                    {t('editor.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </DisabledWithTooltip>
          )}

          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/deliverables`}>
              <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
              {t('common.back')}
            </Link>
          </Button>
          <ContextualHelp
            title={t('editor.help.title')}
            description={t('editor.help.text')}
            tips={[
              t('editor.help.1'),
              t('editor.help.2'),
              t('editor.help.3'),
              t('editor.help.4'),
              t('editor.help.5'),
            ]}
          />
        </ToolbarActions>
      </Toolbar>

        {/* Workflow stepper */}
        <div className="mb-5">
          <DeliverableWorkflowStepper status={deliverable.status} />
        </div>

        {/* Read-only alert for submitted deliverables */}
        {deliverable.status === 'SUBMITTED' && (
          <div className="flex items-center gap-2 rounded-lg bg-info/10 p-3 mb-4">
            <KeenIcon icon="information-2" style="duotone" className="size-4 text-info shrink-0" />
            <p className="text-sm text-info">
              {t('editor.readOnly')}
            </p>
          </div>
        )}

        <div className={showTemplate ? 'grid grid-cols-1 lg:grid-cols-3 gap-4' : ''}>
          {/* WYSIWYG Editor */}
          <Card className={showTemplate ? 'lg:col-span-2' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('editor.editor')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <RichTextEditor
                content={content}
                onChange={handleContentChange}
                disabled={isReadOnly}
                placeholder={t('editor.placeholder')}
              />
            </CardContent>
          </Card>

          {/* Template side panel */}
          {showTemplate && template ? (
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-primary">
                    {t('editor.templateTitle', { title: template.title })}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(template.content).then(() => {
                        toast(t('editor.templateCopied'));
                      }).catch(() => {
                        toast.error(t('editor.copyError'));
                      });
                    }}
                  >
                    <KeenIcon icon="copy" style="duotone" className="size-3 mr-1" />
                    {t('editor.copyTemplate')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto border-t border-border">
                  <MarkdownPreview content={template.content} />
                  {template.pmiProcess && (
                    <div className="px-4 pb-4 pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">{t('editor.pmiProcess')}</span>{' '}
                        {template.pmiProcess}
                      </p>
                    </div>
                  )}
                </div>
                {template.evaluationCriteria && Object.keys(template.evaluationCriteria).length > 0 && (
                  <div className="px-4 pb-4 pt-3 border-t border-border">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      {t('editor.criteria')}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(template.evaluationCriteria).map(([key, value]) => (
                        <Badge
                          key={key}
                          variant="info"
                          appearance="light"
                          size="xs"
                        >
                          <KeenIcon icon="check-circle" style="duotone" className="size-3 mr-1" />
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
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{t('dashboard.active.phase', { n: deliverable.phaseOrder })}</span>
          <span>
            {t('deliverables.revision', { n: deliverable.revisionNumber, max: deliverable.maxRevisions })}
          </span>
          {deliverable.dueDate && (
            <span>
              {t('editor.due', { date: new Date(deliverable.dueDate).toLocaleDateString(intlLocale) })}
            </span>
          )}
        </div>
    </div>
  );
}
