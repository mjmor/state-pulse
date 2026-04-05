import ComparisonPageClient from './ComparisonPageClient';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'Policy Comparison Tool - Cross-Jurisdiction Analysis',
  description: 'Compare legislation across states on key policy topics side by side.',
  keywords: ['policy comparison', 'cross-jurisdiction', 'state legislation', 'energy policy'],
  url: '/comparison',
});

export default function ComparisonPage() {
  return <ComparisonPageClient />;
}
