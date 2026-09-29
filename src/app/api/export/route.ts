import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, getAllClusters, getAllRecommendations, getAllProjects } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'json';
  const type = searchParams.get('type') || 'brief';
  const officer = searchParams.get('officer') || 'Executive Infrastructure Officer';

  const timestamp = new Date().toISOString();
  const [submissions, clusters, recommendations, projects] = await Promise.all([
    getAllSubmissions(),
    getAllClusters(),
    getAllRecommendations(),
    getAllProjects(),
  ]);

  if (format === 'csv') {
    if (type === 'submissions') {
      const headers = ['ID', 'ReferenceCode', 'Timestamp', 'Country', 'District', 'Domain', 'Subcategory', 'Urgency', 'Status', 'AffectedPopulation'];
      const rows = submissions.map(s => [
        s.id,
        s.referenceCode,
        s.timestamp,
        `"${s.location.country}"`,
        `"${s.location.district}"`,
        s.category,
        `"${s.subcategory}"`,
        s.urgency,
        s.status,
        s.affectedPopulationEstimate || 0
      ].join(','));
      const csvContent = [headers.join(','), ...rows].join('\n');
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="brics-civicpulse-submissions-${Date.now()}.csv"`
        }
      });
    }

    if (type === 'recommendations') {
      const headers = ['Rank', 'Title', 'Domain', 'Country', 'District', 'CompositeScore', 'EstimatedBudgetUsd', 'Beneficiaries', 'Status'];
      const rows = recommendations.map(r => [
        r.rank,
        `"${r.title}"`,
        r.domain,
        `"${r.country}"`,
        `"${r.district}"`,
        r.compositeScore,
        r.estimatedBudgetUsd,
        r.beneficiariesCount,
        r.approvedStatus
      ].join(','));
      const csvContent = [headers.join(','), ...rows].join('\n');
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="brics-civicpulse-recommendations-${Date.now()}.csv"`
        }
      });
    }
  }

  // Markdown Decision Brief format (Human-readable)
  if (format === 'brief') {
    const markdownBrief = `# BRICS CivicPulse: Public Infrastructure Prioritization Brief
**Digital Public Infrastructure & Governance Decision Record**
- **Date & Timestamp:** ${timestamp}
- **Authorizing Officer:** ${officer}
- **Data Freshness:** Real-time synchronized
- **AI Gateway Active Model:** Multi-Agent Resilient Gateway (Gemini 1.5 Flash / Groq Llama 3.3 / OpenRouter)

---

## 1. Executive Summary & Demand Signal
During the active reporting period, **${submissions.length} verified citizen submissions** were ingested across BRICS pilot territories (Water, Roads, Digital Connectivity). Submissions were clustered into **${clusters.length} active demand hotspots** using multilingual semantic entity extraction.

## 2. Prioritized Investment Recommendations (Multi-Criteria Score)
${recommendations.map(r => `
### Rank #${r.rank}: ${r.title}
- **Domain:** ${r.domain.toUpperCase()} | **Region:** ${r.district}, ${r.country}
- **Prioritization Composite Score:** **${r.compositeScore} / 100**
- **Estimated Budget:** $${(r.estimatedBudgetUsd / 1000000).toFixed(2)}M USD
- **Expected Beneficiaries:** ${r.beneficiariesCount.toLocaleString()} citizens
- **Status:** \`${r.approvedStatus}\`
- **Key Assumptions:** ${r.assumptions.join('; ')}
- **Equity Impact:** ${r.equityNotes}
`).join('\n')}

## 3. Active Delivery Registry & Milestones
${projects.map(p => `
- **${p.projectCode} - ${p.title}**
  - Agency: ${p.leadAgency}
  - Status: ${p.liveStatus.toUpperCase()} (Budget: $${(p.allocatedBudgetUsd / 1000000).toFixed(2)}M USD)
  - Current Milestone: ${p.currentMilestone}
  - Citizen Satisfaction: ⭐ ${p.citizenSatisfactionAverage}/5.0 (${p.totalCitizenReviews} reviews)
`).join('\n')}

---
*Generated automatically by BRICS CivicPulse Digital Public Good. All decisions subject to human administrative review.*
`;

    return new NextResponse(markdownBrief, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="brics-civicpulse-policy-brief-${Date.now()}.md"`
      }
    });
  }

  // Default JSON export
  return NextResponse.json({
    metadata: {
      generatedAt: timestamp,
      authorizingOfficer: officer,
      platform: 'BRICS CivicPulse v1.0',
      license: 'Digital Public Good (DPG)',
    },
    summary: {
      totalSubmissions: submissions.length,
      totalClusters: clusters.length,
      totalRecommendations: recommendations.length,
      totalActiveProjects: projects.length,
    },
    data: {
      submissions,
      clusters,
      recommendations,
      projects,
    }
  });
}
