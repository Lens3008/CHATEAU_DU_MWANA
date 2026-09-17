import ContactFormClient from "@/components/public/ContactFormClient";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/public/MotionWrapper";
import { MapPin, Phone, Mail, Clock, Sparkles } from "lucide-react";
import { getSetting } from "@/lib/services/settings";
import { ChateauLine } from "@/components/public/ChateauLine";

export const metadata = {
  title: "Contact | Le Château du Mwana",
  description: "Contactez-nous pour toute question ou réservation de grand événement.",
};

export default async function ContactPage() {
  const address = (await getSetting('contact_address'))?.value || "Adresse sur demande";
  const phone = (await getSetting('contact_phone'))?.value || "Non spécifié";
  const email = (await getSetting('contact_email'))?.value || "contact@chateaudumwana.com";
  const hours = (await getSetting('contact_hours'))?.value || "Non spécifié";

  return (
    <div className="min-h-screen bg-[var(--color-public-bg)] pb-32">
      
      {/* HEADER HERO CONTACT */}
      <div className="relative pt-32 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 opacity-90" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-[var(--color-public-primary)]" />
              <span>Nous joindre</span>
            </div>
            <div className="mb-6">
              <ChateauLine variant="accent" delay={0.1} />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-[var(--font-display)] mb-6 text-white leading-tight">
              Contactez-nous
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
              Une question, une demande spécifique ou un projet d'envergure ? Notre équipe est à votre entière disposition.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* CONTENU SPLIT */}
      <div className="container mx-auto px-4 mt-20 max-w-6xl">
        <div className="bg-white rounded-[3rem] shadow-[var(--shadow-public-card)] overflow-hidden border border-slate-50">
          <div className="grid lg:grid-cols-5">
            
            {/* Colonne de gauche : Infos */}
            <div className="lg:col-span-2 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-public-primary)]/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold font-[var(--font-display)] mb-2">Nos Coordonnées</h2>
                <p className="text-white/70 mb-12">N'hésitez pas à nous contacter directement ou à nous rendre visite sur place.</p>
                
                <StaggerContainer className="space-y-8">
                  <StaggerItem>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[var(--color-public-primary)]">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Adresse</h3>
                        <p className="text-white/70 leading-relaxed whitespace-pre-line">{address}</p>
                      </div>
                    </div>
                  </StaggerItem>
                  
                  <StaggerItem>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[var(--color-public-primary)]">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Téléphone</h3>
                        <p className="text-white/70 leading-relaxed">{phone}</p>
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[var(--color-public-primary)]">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Email</h3>
                        <p className="text-white/70 leading-relaxed">{email}</p>
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[var(--color-public-primary)]">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Horaires</h3>
                        <p className="text-white/70 leading-relaxed whitespace-pre-line">{hours}</p>
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              </div>
            </div>

            {/* Colonne de droite : Formulaire */}
            <div className="lg:col-span-3 p-12 lg:p-16">
              <FadeIn delay={0.2}>
                <h2 className="text-3xl font-bold font-[var(--font-display)] text-slate-900 mb-2">Envoyez-nous un message</h2>
                <p className="text-slate-500 mb-8">Nous vous répondrons dans les plus brefs délais.</p>
                <ContactFormClient />
              </FadeIn>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
