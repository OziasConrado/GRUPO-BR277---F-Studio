
'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import StarRatingInput from "./star-rating-input";
import type { SAUReview } from "@/types/sau";

const reviewSchema = z.object({
  rating: z.number().min(1, "Avaliação é obrigatória.").max(5),
  comment: z.string().min(10, "Comentário deve ter pelo menos 10 caracteres.").max(500, "Comentário muito longo."),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: Omit<SAUReview, 'id' | 'timestamp' | 'author' | 'sauId'>) => void;
  sauName: string;
}

export default function SubmitReviewModal({ isOpen, onClose, onSubmit, sauName }: SubmitReviewModalProps) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const handleSubmit = (data: ReviewFormValues) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) form.reset(); onClose(); }}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Avaliar {sauName}</DialogTitle>
          <DialogDescription>
            Compartilhe sua experiência sobre este SAU.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="rating" className="mb-1 block">Sua Avaliação (estrelas)</Label>
            <Controller
              name="rating"
              control={form.control}
              render={({ field }) => (
                <StarRatingInput
                  value={field.value}
                  onChange={field.onChange}
                  size={32}
                />
              )}
            />
            {form.formState.errors.rating && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.rating.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="comment">Seu Comentário</Label>
            <Textarea
              id="comment"
              placeholder="Descreva sua experiência..."
              {...form.register("comment")}
              className="rounded-lg mt-1 min-h-[100px] bg-background/70"
            />
            {form.formState.errors.comment && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.comment.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Enviar Avaliação</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
