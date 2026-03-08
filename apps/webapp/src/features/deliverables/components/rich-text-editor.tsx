import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import { useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { KeenIcon } from '@/components/keenicons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  icon: string;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({ icon, label, isActive, disabled, onClick }: ToolbarButtonProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              disabled && 'opacity-40 pointer-events-none',
            )}
          >
            <KeenIcon icon={icon} style="outline" className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-1" />;
}

function EditorToolbar({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL du lien :', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-border bg-muted/30">
      {/* Text style */}
      <ToolbarButton
        icon="text-bold"
        label="Gras (Ctrl+B)"
        isActive={editor.isActive('bold')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        icon="text-italic"
        label="Italique (Ctrl+I)"
        isActive={editor.isActive('italic')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        icon="text-underline"
        label="Souligne (Ctrl+U)"
        isActive={editor.isActive('underline')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarButton
        icon="text-strikethrough"
        label="Barre"
        isActive={editor.isActive('strike')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <ToolbarButton
        icon="color-swatch"
        label="Surligner"
        isActive={editor.isActive('highlight')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      />

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        icon="text-number"
        label="Titre 1"
        isActive={editor.isActive('heading', { level: 1 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolbarButton
        icon="text-number"
        label="Titre 2"
        isActive={editor.isActive('heading', { level: 2 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        icon="text-number"
        label="Titre 3"
        isActive={editor.isActive('heading', { level: 3 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        icon="text-align-left"
        label="Aligner a gauche"
        isActive={editor.isActive({ textAlign: 'left' })}
        disabled={disabled}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      />
      <ToolbarButton
        icon="text-align-center"
        label="Centrer"
        isActive={editor.isActive({ textAlign: 'center' })}
        disabled={disabled}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      />
      <ToolbarButton
        icon="text-align-right"
        label="Aligner a droite"
        isActive={editor.isActive({ textAlign: 'right' })}
        disabled={disabled}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      />

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        icon="bullet-list"
        label="Liste a puces"
        isActive={editor.isActive('bulletList')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        icon="numbered-list"
        label="Liste numerotee"
        isActive={editor.isActive('orderedList')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        icon="check-squared"
        label="Liste de taches"
        isActive={editor.isActive('taskList')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      />

      <ToolbarDivider />

      {/* Block elements */}
      <ToolbarButton
        icon="quote-right"
        label="Citation"
        isActive={editor.isActive('blockquote')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolbarButton
        icon="code"
        label="Code inline"
        isActive={editor.isActive('code')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />
      <ToolbarButton
        icon="abstract-26"
        label="Bloc de code"
        isActive={editor.isActive('codeBlock')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />

      <ToolbarDivider />

      {/* Insert */}
      <ToolbarButton
        icon="link"
        label="Lien"
        isActive={editor.isActive('link')}
        disabled={disabled}
        onClick={setLink}
      />
      <ToolbarButton
        icon="row-horizontal"
        label="Tableau"
        disabled={disabled}
        onClick={insertTable}
      />
      <ToolbarButton
        icon="minus"
        label="Separateur"
        disabled={disabled}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />

      <ToolbarDivider />

      {/* History */}
      <ToolbarButton
        icon="arrow-left"
        label="Annuler (Ctrl+Z)"
        disabled={disabled || !editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        icon="arrow-right"
        label="Retablir (Ctrl+Shift+Z)"
        disabled={disabled || !editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  disabled = false,
  placeholder = 'Redigez votre livrable ici...',
  className,
}: RichTextEditorProps) {
  const isSettingContent = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      if (isSettingContent.current) return;
      const md = ed.storage.markdown.getMarkdown();
      onChange(md);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[450px] p-4',
          'prose-headings:font-semibold prose-headings:text-foreground',
          'prose-p:text-foreground prose-p:leading-relaxed',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
          'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs',
          'prose-pre:bg-muted prose-pre:rounded-lg',
          'prose-table:border-collapse',
          'prose-th:border prose-th:border-border prose-th:bg-muted/50 prose-th:p-2 prose-th:text-left prose-th:text-xs prose-th:font-semibold',
          'prose-td:border prose-td:border-border prose-td:p-2 prose-td:text-sm',
          'prose-li:text-foreground',
          '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0',
          '[&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:items-start [&_ul[data-type=taskList]_li]:gap-2',
          '[&_ul[data-type=taskList]_li_label]:mt-0.5',
          disabled && 'opacity-60 cursor-not-allowed',
        ),
      },
    },
  });

  // Sync content from outside (e.g. initial load)
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentMd = editor.storage.markdown?.getMarkdown() ?? '';
      if (currentMd !== content) {
        isSettingContent.current = true;
        editor.commands.setContent(content);
        isSettingContent.current = false;
      }
    }
    // Only sync on content prop change, not editor changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // Sync editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  if (!editor) {
    return (
      <div className={cn('min-h-[450px] flex items-center justify-center', className)}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className={cn('border-t border-border', className)}>
      <EditorToolbar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} />
    </div>
  );
}
