import { db } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FadeIn } from '@/components/public/MotionWrapper';

async function getPublishedPageBySlug(slug: string) {
  const sql = db.raw.sql`
    SELECT * FROM "ContentPage" 
    WHERE slug = ${slug} AND "isPublished" = true
  `;
  const res = await sql;
  const arr = Array.isArray(res) ? res : [];
  return arr.length > 0 ? arr[0] : null;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await getPublishedPageBySlug(params.slug);
  if (!page) return { title: 'Page introuvable | Le Château du Mwana' };

  let desc = '';
  try {
    if (page.seo && typeof page.seo === 'object') {
      desc = (page.seo as any).description || '';
    }
  } catch(e) {}

  return {
    title: `${page.title} | Le Château du Mwana`,
    description: desc,
  };
}

export default async function PublicCMSPage({ params }: { params: { slug: string } }) {
  const page = await getPublishedPageBySlug(params.slug);
  
  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--color-public-bg)] pb-24">
      <div className="bg-[var(--color-public-primary)] py-16 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-bold font-[var(--font-display)]">{page.title}</h1>
          </FadeIn>
        </div>
      </div>

      <div className="wave-bottom text-white bg-[var(--color-public-primary)]">
        <svg className="wave-svg fill-current" preserveAspectRatio="none" viewBox="0 0 1440 120">
          <path d="M0 0l48 10.7C96 21 192 43 288 48c96 5 192-5 288-16s192-21 288-10.7c96 10.3 192 42.3 288 48C1248 75 1344 53 1392 42.7L1440 32v88H0V0z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <FadeIn className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-[var(--shadow-public-card)] border border-slate-100">
          <div 
            className="prose prose-lg prose-slate max-w-none prose-headings:font-[var(--font-display)] prose-a:text-[var(--color-public-primary)]"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </FadeIn>
      </div>
    </div>
  );
}
