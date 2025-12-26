'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit, Send, Loader2, Image as ImageIcon, ListChecks, Check, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const cardStyles = [
  { name: 'Padrão', bg: 'bg-card', text: 'text-card-foreground', gradient: '' },
  { name: 'Azul', bg: '', text: 'text-white', gradient: 'linear-gradient(to right, #002776, #004aad)' },
  { name: 'Verde', bg: '', text: 'text-white', gradient: 'linear-gradient(to right, #009c3b, #007a2e)' },
  { name: 'Amarelo', bg: '', text: '#333', gradient: 'linear-gradient(to right, #ffdf00, #e6c600)' },
  { name: 'Brasil', bg: '', text: 'text-white', gradient: 'linear-gradient(90deg, #002776 0%, #009c3b 50%, #ffdf00 100%)' },
];

const PollCreator = ({ onSave, onCancel }: { onSave: (question: string, options: string[]) => void; onCancel: () => void; }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };
  
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (question.trim() && validOptions.length >= 2) {
      onSave(question.trim(), validOptions);
    } else {
       // Basic validation feedback, can be improved with toast
      alert("A pergunta e pelo menos duas opções são obrigatórias.");
    }
  };

  return (
     <Dialog defaultOpen onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Enquete</DialogTitle>
          <DialogDescription>
            Faça uma pergunta para a comunidade.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="poll-question">Pergunta</Label>
            <Input id="poll-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Qual a sua opinião sobre...?" />
          </div>
          <div className="space-y-2">
             <Label>Opções (mínimo 2, máximo 4)</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Opção ${index + 1}`} />
                 {options.length > 2 && (
                    <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="text-destructive h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            ))}
          </div>
           {options.length < 4 && (
             <Button variant="outline" size="sm" onClick={addOption} className="mt-2">Adicionar Opção</Button>
           )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
             <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Salvar Enquete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function CreatePost() {
  const { currentUser, isProfileComplete, firestore, uploadFile } = useAuth();
  const { toast } = useToast();
  
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(cardStyles[0]);
  const [pollData, setPollData] = useState<{ question: string; options: {id: string, text: string, votes: number}[]; } | null>(null);
  const [isPollCreatorOpen, setIsPollCreatorOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const resetForm = () => {
    setPostText('');
    setImageFile(null);
    setImagePreview(null);
    setPollData(null);
    setSelectedStyle(cardStyles[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
     if (!currentUser || !firestore) {
      toast({ variant: 'destructive', description: 'Você precisa estar logado para publicar.' });
      return;
    }
    if (!postText.trim() && !imageFile && !pollData) {
      toast({ variant: 'destructive', description: 'Você precisa escrever algo, adicionar uma imagem ou criar uma enquete.' });
      return;
    }
    if (!isProfileComplete) {
       toast({ variant: 'destructive', title: "Perfil Incompleto", description: 'Complete seu perfil (nome e cidade) para publicar.' });
       return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrl: string | undefined;
      if (imageFile) {
        const filePath = `posts/${currentUser.uid}/${Date.now()}_${imageFile.name}`;
        uploadedImageUrl = await uploadFile(imageFile, filePath);
      }
      
      const postPayload: any = {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userAvatarUrl: currentUser.photoURL,
        userLocation: isProfileComplete ? (currentUser as any).location : "Localização não definida",
        bio: isProfileComplete ? (currentUser as any).bio : "Usuário da comunidade",
        instagramUsername: isProfileComplete ? (currentUser as any).instagramUsername : undefined,
        text: postText,
        uploadedImageUrl: uploadedImageUrl,
        cardStyle: selectedStyle,
        timestamp: serverTimestamp(),
        reactions: { thumbsUp: 0, thumbsDown: 0 },
        deleted: false,
      };

      if (pollData) {
        postPayload.poll = pollData;
      }
      
      await addDoc(collection(firestore, 'posts'), postPayload);

      toast({ title: 'Sucesso!', description: 'Sua publicação foi postada.' });
      resetForm();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível criar a publicação.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Arquivo inválido', description: 'Por favor, selecione uma imagem.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: 'Imagem muito grande', description: 'O tamanho máximo da imagem é 5MB.' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setSelectedStyle(cardStyles[0]); // Reset style when image is added
      setPollData(null); // Remove poll when image is added
    }
  };
  
  const handleCreatePoll = (question: string, options: string[]) => {
    setPollData({
      question,
      options: options.map((opt, i) => ({ id: `opt${i+1}`, text: opt, votes: 0 })),
    });
    setIsPollCreatorOpen(false);
    setImageFile(null); // Remove image when poll is added
    setImagePreview(null);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const removePoll = () => setPollData(null);


  return (
    <Card className="rounded-xl shadow-lg w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Edit className="h-5 w-5" />
          Criar Publicação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pollData ? (
          <div className="p-3 border rounded-lg bg-muted/50 relative">
             <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-destructive" onClick={removePoll}>
                <X className="h-4 w-4" />
             </Button>
             <p className="font-semibold text-sm">{pollData.question}</p>
             <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {pollData.options.map(opt => <p key={opt.id}>- {opt.text}</p>)}
             </div>
          </div>
        ) : (
          <Textarea
            placeholder="No que você está pensando?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="min-h-[100px] resize-none rounded-lg"
            style={{
                backgroundImage: imagePreview ? 'none' : selectedStyle.gradient,
                backgroundColor: imagePreview ? 'transparent' : selectedStyle.bg,
                color: imagePreview ? 'inherit' : selectedStyle.text,
            }}
          />
        )}
        
        {imagePreview && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
              <Image src={imagePreview} alt="Preview da imagem" fill style={{objectFit: "cover"}} />
              <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full" onClick={removeImage}>
                  <X className="h-4 w-4"/>
              </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
            {cardStyles.map(style => (
                <button
                    key={style.name}
                    type="button"
                    onClick={() => { setSelectedStyle(style); setImageFile(null); setImagePreview(null); }}
                    className={cn("h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                                 selectedStyle.name === style.name ? 'border-primary' : 'border-muted-foreground/30'
                    )}
                    style={{ background: style.gradient || style.bg }}
                    aria-label={`Selecionar estilo ${style.name}`}
                    disabled={!!imagePreview}
                >
                    {selectedStyle.name === style.name && <Check className="h-5 w-5 text-white mix-blend-difference" />}
                </button>
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center flex-wrap gap-2">
         <div className="flex items-center gap-1">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon />
            </Button>
             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => setIsPollCreatorOpen(true)}>
                <ListChecks />
            </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary cursor-not-supported" disabled>
                <AlertTriangle />
            </Button>
         </div>
         <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? 'Publicando...' : 'Publicar'}
        </Button>
      </CardFooter>
      {isPollCreatorOpen && <PollCreator onSave={handleCreatePoll} onCancel={() => setIsPollCreatorOpen(false)} />}
    </Card>
  );
}
