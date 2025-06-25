
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Globe } from "lucide-react";
import Link from 'next/link';

interface TelefoneUtil {
  nome: string;
  numero: string;
}

const telefonesDiversos: TelefoneUtil[] = [
  { nome: "Detran", numero: "154" },
  { nome: "Direitos Humanos", numero: "100" },
  { nome: "Centro de Valorização da Vida", numero: "141" },
  { nome: "Prevenção às drogas", numero: "132" },
  { nome: "Conselho Tutelar", numero: "125" },
  { nome: "Delegacia da mulher", numero: "180" },
  { nome: "Disque ouvidoria", numero: "162" },
  { nome: "Disque prefeitura", numero: "156" },
  { nome: "Tribunal de justiça", numero: "159" },
  { nome: "SUS", numero: "136" },
  { nome: "Secretaria de saúde", numero: "160" },
  { nome: "Vigilância sanitária", numero: "150" },
  { nome: "Previdência", numero: "135" },
  { nome: "Receita Federal", numero: "146" },
  { nome: "Defensoria pública", numero: "162" },
  { nome: "Disque eleitor", numero: "148" },
  { nome: "Delegacia do trabalho", numero: "158" },
  { nome: "Procon", numero: "151" },
  { nome: "Água e esgoto", numero: "115" },
  { nome: "Energia Elétrica", numero: "116" },
  { nome: "Gás encanado", numero: "117" },
  { nome: "ANAC", numero: "163" },
  { nome: "ANTT", numero: "166" },
  { nome: "ANEEL", numero: "167" },
  { nome: "Anatel", numero: "1331" },
  { nome: "Banco Central", numero: "145" },
];

export default function EmergenciaPage() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Telefones Úteis</h1>
        <p className="text-muted-foreground">Discagem Rápida</p>
      </div>

      {/* --- Trauma, Urgências e Emergências --- */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-left">Trauma, Urgências e Emergências</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button asChild variant="destructive" className="py-6 rounded-lg text-base sm:text-sm lg:text-base">
            <a href="tel:193">
              <Phone className="mr-2 h-5 w-5" />
              193 - Bombeiros | SIATE
            </a>
          </Button>
          <Button asChild variant="destructive" className="py-6 rounded-lg text-base sm:text-sm lg:text-base">
            <a href="tel:192">
              <Phone className="mr-2 h-5 w-5" />
              192 - SAMU
            </a>
          </Button>
          <Button asChild variant="destructive" className="py-6 rounded-lg text-base sm:text-sm lg:text-base">
            <a href="tel:199">
              <Phone className="mr-2 h-5 w-5" />
              199 - Defesa Civil
            </a>
          </Button>
        </div>
      </section>

      {/* --- Segurança Pública --- */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-left">Segurança Pública</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button asChild variant="secondary" className="py-5 rounded-lg text-base hover:bg-slate-300 dark:hover:bg-slate-700">
            <a href="tel:153">
              <Phone className="mr-2 h-4 w-4" />
              153 - Guarda Municipal
            </a>
          </Button>
          <Button asChild variant="secondary" className="py-5 rounded-lg text-base hover:bg-slate-300 dark:hover:bg-slate-700">
            <a href="tel:190">
              <Phone className="mr-2 h-4 w-4" />
              190 - Polícia Militar
            </a>
          </Button>
          <Button asChild variant="secondary" className="py-5 rounded-lg text-base hover:bg-slate-300 dark:hover:bg-slate-700">
            <a href="tel:191">
              <Phone className="mr-2 h-4 w-4" />
              191 - Polícia Rod. Federal
            </a>
          </Button>
          <Button asChild variant="secondary" className="py-5 rounded-lg text-base hover:bg-slate-300 dark:hover:bg-slate-700">
            <a href="tel:198">
              <Phone className="mr-2 h-4 w-4" />
              198 - Polícia Rod. Estadual
            </a>
          </Button>
          <Button asChild variant="secondary" className="py-5 rounded-lg text-base hover:bg-slate-300 dark:hover:bg-slate-700">
            <a href="tel:194">
              <Phone className="mr-2 h-4 w-4" />
              194 - Polícia Federal
            </a>
          </Button>
          <Button asChild variant="secondary" className="py-5 rounded-lg text-base hover:bg-slate-300 dark:hover:bg-slate-700">
            <a href="tel:197">
              <Phone className="mr-2 h-4 w-4" />
              197 - Polícia Civil
            </a>
          </Button>
           <Button asChild variant="secondary" className="py-5 rounded-lg text-base hover:bg-slate-300 dark:hover:bg-slate-700 sm:col-span-2 lg:col-span-3">
            <a href="tel:181">
              <Phone className="mr-2 h-4 w-4" />
              181 - Disk Denúncia
            </a>
          </Button>
        </div>
      </section>

      {/* --- Cards --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle>Disque 100</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              O Disque 100 é vinculado ao Programa Nacional de Enfrentamento da Violência Sexual contra Crianças e Adolescentes.
            </p>
          </CardContent>
          <CardContent>
             <Button asChild variant="default" className="w-full rounded-full">
              <a href="tel:100"><Phone className="mr-2 h-4 w-4" /> Ligar para 100</a>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle>Disque 180</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              O Disque 180 é um serviço de utilidade pública essencial para o enfrentamento à violência contra a mulher.
            </p>
          </CardContent>
          <CardContent>
            <Button asChild variant="default" className="w-full rounded-full">
              <a href="tel:180"><Phone className="mr-2 h-4 w-4" /> Ligar para 180</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md md:col-span-2">
          <CardHeader>
            <CardTitle>Delegacia Eletrônica</CardTitle>
            <CardDescription>Registro de Boletim de Ocorrência (B.O) online, nos Estados do Sul do Brasil.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
             <Button asChild variant="secondary" className="rounded-full hover:bg-slate-300 dark:hover:bg-slate-700">
                <a href="https://www.policiacivil.pr.gov.br/BO" target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" /> Paraná
                </a>
            </Button>
            <Button asChild variant="secondary" className="rounded-full hover:bg-slate-300 dark:hover:bg-slate-700">
                <a href="https://delegaciavirtual.sc.gov.br/" target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" /> Santa Catarina
                </a>
            </Button>
             <Button asChild variant="secondary" className="rounded-full hover:bg-slate-300 dark:hover:bg-slate-700">
                <a href="https://www.delegaciaonline.rs.gov.br/dol/#!/index/main" target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" /> Rio Grande do Sul
                </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* --- Telefones Diversos Accordion --- */}
      <section>
        <Accordion type="single" collapsible className="w-full bg-card p-2 rounded-xl border">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="text-lg font-semibold px-4 hover:no-underline">Telefones Diversos</AccordionTrigger>
            <AccordionContent>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                {telefonesDiversos.map((tel) => (
                  <a key={tel.numero + tel.nome} href={`tel:${tel.numero}`} className="text-foreground hover:text-primary hover:underline text-sm">
                    <span className="font-semibold">{tel.numero}</span> - {tel.nome}
                  </a>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

    </div>
  );
}
