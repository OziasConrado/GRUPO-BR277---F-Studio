
'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, UserSquare, PlusCircle, Trash2, Download, UploadCloud, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Script from 'next/script';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

const experienciaSchema = z.object({
  empresa: z.string().min(1, "Empresa é obrigatória"),
  cargo: z.string().min(1, "Cargo é obrigatório"),
  periodo: z.string().min(1, "Período é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
});

const formacaoSchema = z.object({
  instituicao: z.string().min(1, "Instituição é obrigatória"),
  curso: z.string().min(1, "Curso é obrigatório"),
  periodo: z.string().min(1, "Período é obrigatório"),
});

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const curriculoSchema = z.object({
  nome: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  telefone: z.string().min(10, "Telefone inválido").min(1, "Telefone é obrigatório"),
  linkedin: z.string().url("URL do LinkedIn inválida").optional().or(z.literal('')),
  foto: z.custom<File | undefined>()
    .refine(file => file === undefined || file.size <= MAX_FILE_SIZE_BYTES, `Foto deve ter no máximo ${MAX_FILE_SIZE_MB}MB.`)
    .refine(file => file === undefined || ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Formato de foto inválido (JPG, PNG, WebP)."),
  experiencias: z.array(experienciaSchema).optional(),
  formacoes: z.array(formacaoSchema).optional(),
  habilidades: z.string().optional(),
  idiomas: z.string().optional(),
});

type CurriculoFormValues = z.infer<typeof curriculoSchema>;

declare global {
  interface Window {
    html2pdf: any;
  }
}

export default function GeradorCurriculoPage() {
  const [generatedCurriculoHtml, setGeneratedCurriculoHtml] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [curriculoNomeParaTitulo, setCurriculoNomeParaTitulo] = useState<string>('Curriculo');

  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CurriculoFormValues>({
    resolver: zodResolver(curriculoSchema),
    defaultValues: {
      experiencias: [{ empresa: '', cargo: '', periodo: '', descricao: '' }],
      formacoes: [{ instituicao: '', curso: '', periodo: '' }],
      habilidades: '',
      idiomas: '',
      linkedin: '',
    }
  });

  const { fields: experienciaFields, append: appendExperiencia, remove: removeExperiencia } = useFieldArray({
    control,
    name: "experiencias"
  });

  const { fields: formacaoFields, append: appendFormacao, remove: removeFormacao } = useFieldArray({
    control,
    name: "formacoes"
  });
  
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ variant: "destructive", title: "Erro na Imagem", description: `Tamanho máximo da foto: ${MAX_FILE_SIZE_MB}MB.`});
        if(fileInputRef.current) fileInputRef.current.value = "";
        setValue("foto", undefined);
        setImagePreview(null);
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast({ variant: "destructive", title: "Erro na Imagem", description: "Formato de foto inválido (JPG, PNG, WebP)."});
        if(fileInputRef.current) fileInputRef.current.value = "";
        setValue("foto", undefined);
        setImagePreview(null);
        return;
      }
      setValue("foto", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue("foto", undefined);
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setValue("foto", undefined, { shouldValidate: true });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmitForm = (data: CurriculoFormValues) => {
    setCurriculoNomeParaTitulo(data.nome || 'Curriculo');
    let html = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">`;

    if (imagePreview) {
      html += `<img src="${imagePreview}" alt="Foto de Perfil" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; border: 2px solid #002776;">`;
    }
    html += `<h1 style="color: #002776; border-bottom: 2px solid #002776; padding-bottom: 5px;">${data.nome}</h1>`;
    html += `<p style="margin-bottom: 15px;">Email: ${data.email} | Telefone: ${data.telefone}`;
    if (data.linkedin) {
      html += ` | LinkedIn: <a href="${data.linkedin}" target="_blank" style="color: #002776; text-decoration: none;">${data.linkedin}</a>`;
    }
    html += `</p>`;

    if (data.experiencias && data.experiencias.length > 0 && data.experiencias.some(exp => exp.empresa)) {
      html += `<h2 style="color: #0056b3; margin-top: 20px;">Experiência Profissional</h2>`;
      data.experiencias.forEach(exp => {
        if(exp.empresa || exp.cargo || exp.periodo || exp.descricao) {
            html += `<div style="margin-bottom: 15px;">`;
            html += `<h3 style="margin-bottom: 2px; font-size: 1.1em;">${exp.cargo || 'Cargo não informado'}</h3>`;
            html += `<p style="margin: 0 0 2px 0;"><strong>${exp.empresa || 'Empresa não informada'}</strong> | ${exp.periodo || 'Período não informado'}</p>`;
            html += `<p style="margin: 0; font-size: 0.9em; color: #555;">${exp.descricao || 'Descrição não informada'}</p>`;
            html += `</div>`;
        }
      });
    }

    if (data.formacoes && data.formacoes.length > 0 && data.formacoes.some(form => form.instituicao)) {
      html += `<h2 style="color: #0056b3; margin-top: 20px;">Formação Acadêmica</h2>`;
      data.formacoes.forEach(form => {
         if(form.instituicao || form.curso || form.periodo) {
            html += `<div style="margin-bottom: 15px;">`;
            html += `<h3 style="margin-bottom: 2px; font-size: 1.1em;">${form.curso || 'Curso não informado'}</h3>`;
            html += `<p style="margin: 0;"><strong>${form.instituicao || 'Instituição não informada'}</strong> | ${form.periodo || 'Período não informado'}</p>`;
            html += `</div>`;
         }
      });
    }

    if (data.habilidades) {
      html += `<h2 style="color: #0056b3; margin-top: 20px;">Habilidades</h2>`;
      html += `<p>${data.habilidades.split(',').map(h => h.trim()).filter(h => h).join(' &bull; ')}</p>`;
    }

    if (data.idiomas) {
      html += `<h2 style="color: #0056b3; margin-top: 20px;">Idiomas</h2>`;
      html += `<p>${data.idiomas}</p>`;
    }
    html += `</div>`;
    setGeneratedCurriculoHtml(html);
    toast({ title: "Currículo Gerado!", description: "Confira o preview abaixo." });
  };

  const handleLimparCampos = () => {
    reset({
      nome: '', email: '', telefone: '', linkedin: '', foto: undefined,
      experiencias: [{ empresa: '', cargo: '', periodo: '', descricao: '' }],
      formacoes: [{ instituicao: '', curso: '', periodo: '' }],
      habilidades: '', idiomas: ''
    });
    setGeneratedCurriculoHtml('');
    removeImage();
    toast({ title: "Campos Limpos" });
  };

  const handleDownloadPdf = () => {
    if (!generatedCurriculoHtml) {
      toast({ variant: "destructive", title: "Nada para Baixar", description: "Gere o currículo primeiro." });
      return;
    }
    if (!window.html2pdf) {
      toast({ variant: "destructive", title: "Erro ao Baixar", description: "A biblioteca de PDF não carregou. Tente recarregar a página." });
      return;
    }

    const element = document.createElement('div');
    element.innerHTML = generatedCurriculoHtml;
    
    const opt = {
      margin:       1,
      filename:     `Curriculo_${curriculoNomeParaTitulo.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };
    
    toast({ title: "Gerando PDF...", description: "Seu download começará em breve." });
    
    window.html2pdf().from(element).set(opt).save();
  };

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Ferramentas
        </Link>

        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserSquare className="w-7 h-7 text-primary" />
              <CardTitle className="font-headline text-xl sm:text-2xl">Gerador de Currículo</CardTitle>
            </div>
            <CardDescription>Crie um currículo profissional de forma simples.</CardDescription>
          </CardHeader>
          <CardContent>
            <AdPlaceholder className="mb-6" />
            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
              
              <section>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo <span className="text-destructive">*</span></Label>
                    <Input id="nome" {...register("nome")} className="rounded-lg mt-1" />
                    {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="foto">Foto 3x4 (Opcional)</Label>
                    <Input 
                        id="foto"
                        ref={fileInputRef}
                        type="file" 
                        accept="image/png, image/jpeg, image/webp" 
                        className="hidden"
                        onChange={handleImageChange}
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Clique para enviar ou alterar a foto"
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
                      className="mt-1 flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-input hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer transition-colors"
                    >
                        {imagePreview ? (
                            <div className="relative w-24 h-24">
                                <Image src={imagePreview} alt="Preview da foto" layout="fill" objectFit="cover" className="rounded"/>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Remover foto"
                                    className="absolute -top-2 -right-2 h-6 w-6 z-10 bg-destructive text-destructive-foreground rounded-full p-1 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); removeImage(); }}}
                                >
                                    <X className="h-4 w-4"/>
                                </div>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground"/>
                                <span className="text-muted-foreground text-sm mt-1">Enviar foto (Max {MAX_FILE_SIZE_MB}MB)</span>
                                <span className="text-xs text-muted-foreground/80 mt-0.5">JPG, PNG, WebP</span>
                            </>
                        )}
                    </div>
                    {errors.foto && <p className="text-sm text-destructive mt-1">{errors.foto.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                    <Input id="email" type="email" {...register("email")} className="rounded-lg mt-1" />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone <span className="text-destructive">*</span></Label>
                    <Input id="telefone" type="tel" {...register("telefone")} className="rounded-lg mt-1" />
                    {errors.telefone && <p className="text-sm text-destructive mt-1">{errors.telefone.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="linkedin">LinkedIn (URL completa, opcional)</Label>
                    <Input id="linkedin" type="url" {...register("linkedin")} className="rounded-lg mt-1" placeholder="https://linkedin.com/in/seu-perfil"/>
                    {errors.linkedin && <p className="text-sm text-destructive mt-1">{errors.linkedin.message}</p>}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Experiência Profissional</h3>
                {experienciaFields.map((field, index) => (
                  <Card key={field.id} className="mb-4 p-4 rounded-lg border bg-muted/20">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`experiencias.${index}.empresa`}>Empresa</Label>
                        <Input id={`experiencias.${index}.empresa`} {...register(`experiencias.${index}.empresa`)} className="rounded-lg mt-1" />
                        {errors.experiencias?.[index]?.empresa && <p className="text-sm text-destructive mt-1">{errors.experiencias[index]?.empresa?.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`experiencias.${index}.cargo`}>Cargo</Label>
                        <Input id={`experiencias.${index}.cargo`} {...register(`experiencias.${index}.cargo`)} className="rounded-lg mt-1" />
                         {errors.experiencias?.[index]?.cargo && <p className="text-sm text-destructive mt-1">{errors.experiencias[index]?.cargo?.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`experiencias.${index}.periodo`}>Período</Label>
                        <Input id={`experiencias.${index}.periodo`} {...register(`experiencias.${index}.periodo`)} className="rounded-lg mt-1" placeholder="Ex: Jan/2020 - Dez/2022 ou 2021 - Atual"/>
                         {errors.experiencias?.[index]?.periodo && <p className="text-sm text-destructive mt-1">{errors.experiencias[index]?.periodo?.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`experiencias.${index}.descricao`}>Descrição das Atividades</Label>
                        <Textarea id={`experiencias.${index}.descricao`} {...register(`experiencias.${index}.descricao`)} className="rounded-lg mt-1 min-h-[60px]" />
                         {errors.experiencias?.[index]?.descricao && <p className="text-sm text-destructive mt-1">{errors.experiencias[index]?.descricao?.message}</p>}
                      </div>
                    </div>
                    {experienciaFields.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeExperiencia(index)} className="mt-3 rounded-full text-xs h-auto py-1.5 px-3">
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover Experiência
                      </Button>
                    )}
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={() => appendExperiencia({ empresa: '', cargo: '', periodo: '', descricao: '' })} className="rounded-full text-sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Experiência
                </Button>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Formação Acadêmica</h3>
                {formacaoFields.map((field, index) => (
                  <Card key={field.id} className="mb-4 p-4 rounded-lg border bg-muted/20">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`formacoes.${index}.instituicao`}>Instituição de Ensino</Label>
                        <Input id={`formacoes.${index}.instituicao`} {...register(`formacoes.${index}.instituicao`)} className="rounded-lg mt-1" />
                        {errors.formacoes?.[index]?.instituicao && <p className="text-sm text-destructive mt-1">{errors.formacoes[index]?.instituicao?.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`formacoes.${index}.curso`}>Curso</Label>
                        <Input id={`formacoes.${index}.curso`} {...register(`formacoes.${index}.curso`)} className="rounded-lg mt-1" />
                        {errors.formacoes?.[index]?.curso && <p className="text-sm text-destructive mt-1">{errors.formacoes[index]?.curso?.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor={`formacoes.${index}.periodo`}>Período</Label>
                        <Input id={`formacoes.${index}.periodo`} {...register(`formacoes.${index}.periodo`)} className="rounded-lg mt-1" placeholder="Ex: 2016 - 2019 ou Concluído em 2020"/>
                        {errors.formacoes?.[index]?.periodo && <p className="text-sm text-destructive mt-1">{errors.formacoes[index]?.periodo?.message}</p>}
                      </div>
                    </div>
                    {formacaoFields.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeFormacao(index)} className="mt-3 rounded-full text-xs h-auto py-1.5 px-3">
                         <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover Formação
                      </Button>
                    )}
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={() => appendFormacao({ instituicao: '', curso: '', periodo: '' })} className="rounded-full text-sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Formação
                </Button>
              </section>

              <section>
                 <h3 className="text-lg font-semibold mb-3 border-b pb-2">Outras Informações</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="habilidades">Habilidades (separadas por vírgula)</Label>
                          <Input id="habilidades" {...register("habilidades")} className="rounded-lg mt-1" placeholder="Ex: Pacote Office, Comunicação, Proatividade"/>
                      </div>
                      <div>
                          <Label htmlFor="idiomas">Idiomas (Ex: Inglês - Fluente, Espanhol - Básico)</Label>
                          <Input id="idiomas" {...register("idiomas")} className="rounded-lg mt-1" />
                      </div>
                  </div>
              </section>


              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleLimparCampos} className="w-full sm:w-auto rounded-full">
                  Limpar Campos
                </Button>
                <Button type="submit" className="w-full sm:flex-1 rounded-full py-3 text-base">
                  <UserSquare className="mr-2 h-5 w-5" /> Gerar Preview do Currículo
                </Button>
              </div>
            </form>

            {generatedCurriculoHtml && (
              <div className="mt-10 pt-6 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Preview do Currículo:</h3>
                </div>
                <Card className="rounded-lg shadow-inner">
                  <CardContent className="px-2 py-4 md:px-3 md:py-6 min-h-[300px] bg-white text-black">
                    <div dangerouslySetInnerHTML={{ __html: generatedCurriculoHtml }} />
                  </CardContent>
                </Card>
                <Button onClick={handleDownloadPdf} variant="default" className="rounded-full w-full mt-6 sm:max-w-xs sm:mx-auto">
                    <Download className="mr-2 h-4 w-4" /> Baixar Currículo (PDF)
                </Button>

                <AdPlaceholder className="mt-8" />
                <div className="mt-8 text-center">
                  <h4 className="text-md font-semibold mb-3">Outras Ferramentas Úteis:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <Link href="/ferramentas/gerador-link-whatsapp" passHref>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-lg">
                              <CardContent className="p-4 flex items-center gap-3">
                                  <UserSquare className="w-6 h-6 text-primary"/>
                                  <div>
                                    <p className="font-semibold text-sm">Gerador de Link WhatsApp</p>
                                    <p className="text-xs text-muted-foreground">Crie links diretos para WhatsApp.</p>
                                  </div>
                              </CardContent>
                          </Card>
                      </Link>
                      <Link href="/ferramentas/declaracao-transporte" passHref>
                           <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-lg">
                              <CardContent className="p-4 flex items-center gap-3">
                                  <UserSquare className="w-6 h-6 text-primary"/>
                                  <div>
                                    <p className="font-semibold text-sm">Declaração de Transporte</p>
                                    <p className="text-xs text-muted-foreground">Gere sua declaração rapidamente.</p>
                                  </div>
                              </CardContent>
                          </Card>
                      </Link>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
