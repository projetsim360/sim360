import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  useDeliverableTemplates,
  useCreateDeliverableTemplate,
  useUpdateDeliverableTemplate,
  useToggleDeliverableTemplate,
} from '../api/admin-reference.api';
import { DeliverableTemplateForm } from '../components/deliverable-template-form';
import type {
  DeliverableTemplate,
  PhaseType,
  DeliverableTemplateDifficulty,
  CreateDeliverableTemplateDto,
  UpdateDeliverableTemplateDto,
} from '../types/admin-reference.types';
import { PHASE_LABELS, DIFFICULTY_LABELS } from '../types/admin-reference.types';

const PHASES: PhaseType[] = ['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSURE'];
const DIFFICULTIES: DeliverableTemplateDifficulty[] = ['DISCOVERY', 'STANDARD', 'ADVANCED'];

type SortField = 'title' | 'type' | 'phase' | 'difficulty' | 'version' | 'updatedAt';
type SortDir = 'asc' | 'desc';

export default function DeliverableTemplatesPage() {
  // Filters
  const [search, setSearch] = useState('');
  const [filterPhase, setFilterPhase] = useState<string>('');
  const [filterType, setFilterType] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');

  // Sort
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DeliverableTemplate | null>(null);

  // API query params
  const queryFilters = useMemo(() => ({
    ...(filterPhase && filterPhase !== '_all' ? { phase: filterPhase as PhaseType } : {}),
    ...(filterType ? { type: filterType } : {}),
    ...(filterDifficulty && filterDifficulty !== '_all' ? { difficulty: filterDifficulty as DeliverableTemplateDifficulty } : {}),
    ...(filterActive && filterActive !== '_all'
      ? filterActive === 'true' ? { isActive: true } : { isActive: false }
      : {}),
    ...(search ? { search } : {}),
  }), [filterPhase, filterType, filterDifficulty, filterActive, search]);

  const { data: templates, isLoading, error } = useDeliverableTemplates(queryFilters);
  const createMutation = useCreateDeliverableTemplate();
  const updateMutation = useUpdateDeliverableTemplate();
  const toggleMutation = useToggleDeliverableTemplate();

  // Client-side sort
  const sortedTemplates = useMemo(() => {
    if (!templates) return [];
    const sorted = [...templates].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'type':
          aVal = a.type.toLowerCase();
          bVal = b.type.toLowerCase();
          break;
        case 'phase':
          aVal = PHASE_LABELS[a.phase];
          bVal = PHASE_LABELS[b.phase];
          break;
        case 'difficulty':
          aVal = DIFFICULTY_LABELS[a.difficulty];
          bVal = DIFFICULTY_LABELS[b.difficulty];
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
  }, [templates, sortField, sortDir]);

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
    setEditingTemplate(null);
    setFormOpen(true);
  };

  const handleEdit = (template: DeliverableTemplate) => {
    setEditingTemplate(template);
    setFormOpen(true);
  };

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id, {
      onSuccess: () => toast.success('Statut mis a jour'),
      onError: () => toast.error('Erreur lors de la mise a jour du statut'),
    });
  };

  const handleFormSubmit = (data: CreateDeliverableTemplateDto | UpdateDeliverableTemplateDto) => {
    if (editingTemplate) {
      updateMutation.mutate(
        { id: editingTemplate.id, data },
        {
          onSuccess: () => {
            toast.success('Template mis a jour');
            setFormOpen(false);
            setEditingTemplate(null);
          },
          onError: () => toast.error('Erreur lors de la mise a jour'),
        },
      );
    } else {
      createMutation.mutate(data as CreateDeliverableTemplateDto, {
        onSuccess: () => {
          toast.success('Template cree');
          setFormOpen(false);
        },
        onError: () => toast.error('Erreur lors de la creation'),
      });
    }
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Templates de livrables" />
        <ToolbarActions>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            Nouveau template
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed space-y-4">
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

              <div className="w-36">
                <Input
                  placeholder="Type..."
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  variant="sm"
                />
              </div>

              <div className="w-36">
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Difficulte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Toutes</SelectItem>
                    {DIFFICULTIES.map((diff) => (
                      <SelectItem key={diff} value={diff}>
                        {DIFFICULTY_LABELS[diff]}
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

              {(filterPhase || filterType || filterDifficulty || filterActive || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterPhase('');
                    setFilterType('');
                    setFilterDifficulty('');
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
                Erreur lors du chargement des templates.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && sortedTemplates.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="text-muted-foreground text-sm">Aucun template trouve.</p>
              <Button variant="primary" size="sm" onClick={handleCreate}>
                Creer un premier template
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && sortedTemplates.length > 0 && (
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
                        onClick={() => handleSort('type')}
                      >
                        Type{sortIcon('type')}
                      </th>
                      <th
                        className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('phase')}
                      >
                        Phase{sortIcon('phase')}
                      </th>
                      <th
                        className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('difficulty')}
                      >
                        Difficulte{sortIcon('difficulty')}
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
                    {sortedTemplates.map((tpl) => (
                      <tr
                        key={tpl.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{tpl.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{tpl.type}</td>
                        <td className="px-4 py-3">
                          <Badge variant="info" appearance="light" size="sm">
                            {PHASE_LABELS[tpl.phase]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              tpl.difficulty === 'DISCOVERY'
                                ? 'success'
                                : tpl.difficulty === 'STANDARD'
                                  ? 'warning'
                                  : 'destructive'
                            }
                            appearance="light"
                            size="sm"
                          >
                            {DIFFICULTY_LABELS[tpl.difficulty]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          v{tpl.version}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={tpl.isActive ? 'success' : 'secondary'}
                            appearance="light"
                            size="sm"
                          >
                            {tpl.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(tpl.updatedAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(tpl)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggle(tpl.id)}
                              disabled={toggleMutation.isPending}
                            >
                              {tpl.isActive ? 'Desactiver' : 'Activer'}
                            </Button>
                          </div>
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

      <DeliverableTemplateForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </>
  );
}
