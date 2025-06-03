'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, Phone, MessageSquare, HelpCircle, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const faqItems = [
  {
    value: 'item-1',
    question: 'Como altero minha senha?',
    answer: 'Você pode alterar sua senha na seção "Meu Perfil" > "Configurações de Segurança". Siga as instruções na tela.',
  },
  {
    value: 'item-2',
    question: 'Onde encontro a calculadora de frete?',
    answer: 'A calculadora de frete está disponível na seção "Ferramentas" no menu principal do aplicativo.',
  },
  {
    value: 'item-3',
    question: 'Como reporto um problema na estrada?',
    answer: 'Utilize o botão de Feed para postar um alerta para a comunidade ou, em caso de emergência, use o Botão de Emergência.',
  },
];

const ticketFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  subject: z.string().min(5, { message: "Assunto deve ter pelo menos 5 caracteres." }),
  message: z.string().min(10, { message: "Mensagem deve ter pelo menos 10 caracteres." }),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export default function SAUPage() {
  const { toast } = useToast();
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(data: TicketFormValues) {
    console.log(data);
    toast({
      title: "Chamado Enviado!",
      description: "Seu chamado foi enviado com sucesso. Entraremos em contato em breve.",
    });
    form.reset();
  }

  return (
    <div className="w-full space-y-8">
      <h1 className="text-3xl font-bold font-headline text-center sm:text-left">SAU - Serviço de Atendimento ao Usuário</h1>

      <Card className="glassmorphic rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Phone className="mr-2 h-6 w-6 text-primary" /> Contato Direto</CardTitle>
          <CardDescription>Fale conosco pelos canais abaixo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="flex items-center"><Mail className="mr-2 h-5 w-5 text-muted-foreground" /> <a href="mailto:suporte@rotasegura.com" className="text-primary hover:underline">suporte@rotasegura.com</a></p>
          <p className="flex items-center"><Phone className="mr-2 h-5 w-5 text-muted-foreground" /> (XX) YYYYY-ZZZZ</p>
          <Button className="w-full sm:w-auto rounded-lg mt-2" variant="outline">
            <MessageSquare className="mr-2 h-5 w-5" /> Iniciar Chat em Tempo Real
          </Button>
        </CardContent>
      </Card>

      <Card className="glassmorphic rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><HelpCircle className="mr-2 h-6 w-6 text-primary" /> Perguntas Frequentes (FAQ)</CardTitle>
           <CardDescription>Encontre respostas rápidas para dúvidas comuns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem value={item.value} key={item.value} className="border-b-white/10 dark:border-b-slate-700/10">
                <AccordionTrigger className="hover:no-underline text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="glassmorphic rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Send className="mr-2 h-6 w-6 text-primary" /> Abrir Chamado</CardTitle>
          <CardDescription>Precisa de ajuda? Envie-nos uma mensagem.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">Seu Nome</FormLabel>
                      <FormControl>
                        <Input id="name" placeholder="Nome Completo" {...field} className="rounded-lg bg-background/70"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Seu Email</FormLabel>
                       <FormControl>
                        <Input id="email" type="email" placeholder="seuemail@exemplo.com" {...field} className="rounded-lg bg-background/70"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="subject">Assunto</FormLabel>
                       <FormControl>
                        <Input id="subject" placeholder="Assunto da mensagem" {...field} className="rounded-lg bg-background/70"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="message">Sua Mensagem</FormLabel>
                     <FormControl>
                      <Textarea id="message" placeholder="Descreva seu problema ou dúvida..." {...field} className="rounded-lg min-h-[120px] bg-background/70"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full rounded-lg">
                <Send className="mr-2 h-5 w-5" /> Enviar Chamado
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
