import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useReferenceDocuments,
  useCreateReferenceDocument,
  useUpdateReferenceDocument,
} from '../api/admin-reference.api';
import { ReferenceDocumentForm } from '../components/reference-document-form';
import type {
  ReferenceDocument,
  PhaseType,
  ReferenceDocumentCategory,
  CreateReferenceDocumentDto,
  UpdateReferenceDocumentDto,
} from '../types/admin-reference.types';
import { PHASE_LABELS, CATEGORY_LABELS } from '../types/admin-reference.types';

const PHASES: PhaseType[] = ['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSURE'];
const CATEGORIES: ReferenceDocumentCategory[] = ['TEMPLATE', 'STANDARD', 'BEST_PRACTICE', 'GLOSSARY'];

type SortField = 'title' | 'category' | 'phase' | 'version' | 'updatedAt';
type SortDir = 'asc' | 'desc';

export default function ReferenceDocumentsPage() {
  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPhase, setFilterPhase] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');

  // Sort
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ReferenceDocument | null>(null);

  // API query params
  const queryFilters = useMemo(() => ({
    ...(filterCategory && filterCategory !== '_all' ? { category: filterCategory as ReferenceDocumentCategory } : {}),
    ...(filterPhase && filterPhase !== '_all' ? { phase: filterPhase as PhaseType } : {}),
    ...(filterActive && filterActive !== '_all'
      ? filterActive === 'true' ? { isActive: true } : { isActive: false }
      : {}),
    ...(search ? { search } : {}),
  }), [filterCategory, filterPhase, filterActive, search]);

  const { data: documents, isLoading, error } = useReferenceDocuments(queryFilters);
  const createMutation = useCreateReferenceDocument();
  const updateMutation = useUpdateReferenceDocument();

  // Client-side sort
  const sortedDocuments = useMemo(() => {
    if (!documents) return [];
    const sorted = [...documents].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'category':
          aVal = CATEGORY_LABELS[a.category];
          bVal = CATEGORY_LABELS[b.category];
          break;
        case 'phase':
          aVal = a.phase ? PHASE_LABELS[a.phase] : '';
          bVal = b.phase ? PHASE_LABELS[b.phase] : '';
          break;
        case 'version':
          aVal = a.version;
          bVal = b.version;
          break;
        case 'updatedAt':
          aVal = a.updatedAt;
          bVal = b.updatedAt;
          break;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [documents, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  };

  const handleCreate = () => {
    setEditingDocument(null);
    setFormOpen(true);
  };

  const handleEdit = (doc: ReferenceDocument) => {
    setEditingDocument(doc);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: CreateReferenceDocumentDto | UpdateReferenceDocumentDto) => {
    if (editingDocument) {
      updateMutation.mutate(
        { id: editingDocument.id, data },
        {
          onSuccess: () => {
            toast.success('Document mis a jour');
            setFormOpen(false);
            setEditingDocument(null);
          },
          onError: () => toast.error('Erreur lors de la mise a jour'),
        },
      );
    } else {
      createMutation.mutate(data as CreateReferenceDocumentDto, {
        onSuccess: () => {
          toast.success('Document cree');
          setFormOpen(false);
        },
        onError: () => toast.error('Erreur lors de la creation'),
      });
    }
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Documents de reference" />
        <ToolbarActions>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            Nouveau document
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container space-y-4">
        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-48">
                <Input
                  placeholder="Rechercher par titre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="w-44">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Toutes les categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-44">
                <Select value={filterPhase} onValueChange={setFilterPhase}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Phase PMI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Toutes les phases</SelectItem>
                    {PHASES.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {PHASE_LABELS[phase]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-32">
                <Select value={filterActive} onValueChange={setFilterActive}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Tous</SelectItem>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(filterCategory || filterPhase || filterActive || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterCategory('');
                    setFilterPhase('');
                    setFilterActive('');
                    setSearch('');
                  }}
                >
                  Reinitialiser
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contenu */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-destructive">
                Erreur lors du chargement des documents.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && sortedDocuments.length === 0 && (
          <Card>
            <CardContent>
              <EmptyState
                icon="folder"
                title="Aucun document"
                description="Aucun document ne correspond a vos filtres."
                action={{ label: 'Creer un premier document', onClick: handleCreate }}
              />
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && sortedDocuments.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th
                        className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('title')}
                      >
                        Titre{sortIcon('title')}
                      </th>
                      <th
                        className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('category')}
                      >
                        Categorie{sortIcon('category')}
                      </th>
                      <th
                        className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('phase')}
                      >
                        Phase{sortIcon('phase')}
                      </th>
                      <th
                        className="px-4 py-3 text-center font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('version')}
                      >
                        Version{sortIcon('version')}
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                        Statut
                      </th>
                      <th
                        className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('updatedAt')}
                      >
                        Modifie{sortIcon('updatedAt')}
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDocuments.map((doc) => (
                      <tr
                        key={doc.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{doc.title}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              doc.category === 'GLOSSARY'
                                ? 'info'
                                : doc.category === 'BEST_PRACTICE'
                                  ? 'success'
                                  : doc.category === 'STANDARD'
                                    ? 'warning'
                                    : 'primary'
                            }
                            appearance="light"
                            size="sm"
                          >
                            {CATEGORY_LABELS[doc.category]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {doc.phase ? (
                            <Badge variant="info" appearance="light" size="sm">
                              {PHASE_LABELS[doc.phase]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          v{doc.version}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={doc.isActive ? 'success' : 'secondary'}
                            appearance="light"
                            size="sm"
                          >
                            {doc.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(doc.updatedAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(doc)}
                          >
                            Modifier
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ReferenceDocumentForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingDocument(null);
        }}
        document={editingDocument}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </>
  );
}
