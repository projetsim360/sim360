import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useReview, useCreateReview } from '../api/mentoring.api';
import { useT } from '@/i18n/app/use-t';

const reviewSchema = z.object({
  humanScore: z.coerce
    .number()
    .int()
    .min(0, 'Minimum 0')
    .max(100, 'Maximum 100'),
  leadershipScore: z.coerce
    .number()
    .int()
    .min(0, 'Minimum 0')
    .max(100, 'Maximum 100')
    .optional()
    .or(z.literal('')),
  diplomacyScore: z.coerce
    .number()
    .int()
    .min(0, 'Minimum 0')
    .max(100, 'Maximum 100')
    .optional()
    .or(z.literal('')),
  postureScore: z.coerce
    .number()
    .int()
    .min(0, 'Minimum 0')
    .max(100, 'Maximum 100')
    .optional()
    .or(z.literal('')),
  feedback: z.string().min(1, 'mentoring.reviewForm.feedbackRequired'),
  recommendations: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function MentorReviewPage() {
  const t = useT();
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const navigate = useNavigate();
  const { data: review, isLoading } = useReview(evaluationId ?? '');
  const createReview = useCreateReview();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      humanScore: 0,
      leadershipScore: '',
      diplomacyScore: '',
      postureScore: '',
      feedback: '',
      recommendations: '',
    },
  });

  const onSubmit = (values: ReviewFormValues) => {
    if (!evaluationId) return;

    createReview.mutate(
      {
        evaluationId,
        humanScore: values.humanScore,
        leadershipScore:
          values.leadershipScore !== '' && values.leadershipScore !== undefined
            ? Number(values.leadershipScore)
            : undefined,
        diplomacyScore:
          values.diplomacyScore !== '' && values.diplomacyScore !== undefined
            ? Number(values.diplomacyScore)
            : undefined,
        postureScore:
          values.postureScore !== '' && values.postureScore !== undefined
            ? Number(values.postureScore)
            : undefined,
        feedback: values.feedback,
        recommendations: values.recommendations || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('mentoring.reviewSent'));
          navigate('/mentoring');
        },
        onError: () => {
          toast.error(t('mentoring.reviewError'));
        },
      },
    );
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">
            {t('mentoring.reviewTitle')}
          </h1>
          <p className="text-sm text-gray-700">
            {t('mentoring.reviewDesc')}
          </p>
        </ToolbarHeading>
        <ToolbarActions>
          <Button variant="outline" size="sm" onClick={() => navigate('/mentoring')}>
            <KeenIcon icon="arrow-left" style="duotone" className="text-sm" />
            {t('common.back')}
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed space-y-5">
        {/* Automatic evaluation summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeenIcon icon="ai-network" style="duotone" />
              {t('mentoring.autoEval')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex gap-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            ) : review ? (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">{t('mentoring.deliverableColon')}</span>
                  <span className="font-medium">
                    {review.deliverable?.title ?? t('mentoring.unavailable')}
                  </span>
                </div>
                {review.score !== undefined && (
                  <Badge variant="info" size="sm">
                    Score automatique : {review.score}/100
                  </Badge>
                )}
                {review.grade && (
                  <Badge variant="primary" size="sm">
                    Grade : {review.grade}
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('mentoring.noEval')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Review form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeenIcon icon="clipboard-check" style="duotone" />
              {t('mentoring.reviewForm.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="humanScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('mentoring.reviewForm.human')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leadershipScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leadership (0-100)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder={t('mentoring.reviewForm.optional')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diplomacyScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('mentoring.reviewForm.diplomacy')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder={t('mentoring.reviewForm.optional')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postureScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posture (0-100)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder={t('mentoring.reviewForm.optional')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder={t('mentoring.reviewForm.feedbackPh')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recommendations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('mentoring.reviewForm.recommendations')}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder={t('mentoring.reviewForm.recommendationsPh')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={createReview.isPending}
                  >
                    {createReview.isPending ? (
                      <>
                        <KeenIcon
                          icon="loading"
                          style="duotone"
                          className="animate-spin text-sm"
                        />
                        {t('mentoring.reviewForm.sending')}
                      </>
                    ) : (
                      <>
                        <KeenIcon icon="check" style="duotone" className="text-sm" />
                        {t('mentoring.reviewForm.submit')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
