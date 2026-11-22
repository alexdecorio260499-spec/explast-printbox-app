'use client';

import React, { useState } from 'react';
import { DemoService } from '@/lib/sales/demo-service';
import { AppUser } from '@/types/demo';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { KPICard } from '../ui/KPICard';
import { PageHeader } from '../ui/PageHeader';
import { AreaLineChart } from '../ui/charts/AreaLineChart';
import { DonutChart } from '../ui/charts/DonutChart';
import {
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  Factory,
  Clock,
  AlertCircle,
  Plus,
  ExternalLink,
  ChevronRight,
  Building,
  User,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface ModernDashboardViewProps {
  brand: string;
  projects: any[];
  currentUser: AppUser;
  onNewProject: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenClient: (customerId: string) => void;
  onOpenProject: (project: any) => void;
}

export function ModernDashboardView({
  brand,
  projects,
  currentUser,
  onNewProject,
  onNavigateTab,
  onOpenClient,
  onOpenProject,
}: ModernDashboardViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'last_month' | '3months' | 'ytd'>('ytd');

  const isAdmin = currentUser.role === 'admin';
  const effectiveRep = isAdmin ? undefined : currentUser.name;

  const brandProjects = projects
    .filter(p => !p.brand || p.brand === brand || p.business_unit === brand)
    .filter(p => isAdmin || p.assigned_salesperson === currentUser.name || p.salesperson === currentUser.name);

  // Fetch period-scoped metrics from central analytics engine
  const metrics = DemoService.getAnalyticsMetrics({
    salespersonName: effectiveRep,
    period: selectedPeriod,
    brand,
  });

  const activities = DemoService.getActivities();

  const periodLabels: Record<string, string> = {
    month: 'This Month',
    last_month: 'Last Month',
    '3months': 'Last 3 Months',
    ytd: 'Year to Date',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* A. DASHBOARD HEADER */}
      <PageHeader
        eyebrow={isAdmin ? 'Enterprise Modern Overview' : `Sales Representative Portal • ${currentUser.name}`}
        badgeText={isAdmin ? `${brand} Executive Access` : `Portfolio: ${currentUser.name}`}
        badgeVariant={isAdmin ? 'neutral' : 'brand'}
        title="Dashboard"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Period Selector */}
            <div className="bg-bg-card border border-border-strong/70 rounded-lg p-1 flex shadow-2xs">
              {(['month', 'last_month', '3months', 'ytd'] as const).map((pKey) => (
                <button
                  key={pKey}
                  type="button"
                  onClick={() => setSelectedPeriod(pKey)}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    selectedPeriod === pKey
                      ? 'bg-brand-primary text-white font-semibold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  {periodLabels[pKey]}
                </button>
              ))}
            </div>

            <Button onClick={onNewProject}>
              <Plus className="w-4 h-4 mr-2" /> New Request
            </Button>
          </div>
        }
      />

      {/* B. MAIN KPI CARDS (ROW 1 - 4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 – Total Quoted Value */}
        <KPICard
          label="Total Quoted Value"
          value={`Rs ${metrics.sales.totalQuotationValue.toLocaleString()}`}
          variation={metrics.sales.quotedVariation}
          trend={`Across ${metrics.sales.totalQuotationsCount} formal proposals`}
          sparklineData={metrics.sales.quotedSparkline}
          sparklineColor="teal"
          accent="brand"
          icon={TrendingUp}
        />

        {/* Card 2 – Active Projects */}
        <KPICard
          label={isAdmin ? 'Active Projects' : 'My Active Projects'}
          value={brandProjects.length}
          variation={{
            percent: 8.5,
            isPositive: true,
            comparisonText: `+8.5% vs previous period`,
          }}
          trend={`${metrics.sales.totalRequests} total requests logged`}
          sparklineData={[12, 14, 15, 17, 16, brandProjects.length]}
          sparklineColor="teal"
          accent="purple"
          icon={FolderKanban}
        />

        {/* Card 3 – Commercial Win Rate */}
        <KPICard
          label="Commercial Win Rate"
          value={`${metrics.sales.conversionRate}%`}
          variation={metrics.sales.conversionVariation}
          trend={`Rs ${(metrics.sales.acceptedQuotationValue / 1000).toFixed(0)}k signed purchase orders`}
          sparklineData={[58, 62, 60, 65, 64, metrics.sales.conversionRate]}
          sparklineColor="emerald"
          accent="success"
          icon={CheckCircle2}
        />

        {/* Card 4 – Active Plant Orders */}
        <KPICard
          label="Active Plant Orders"
          value={`${metrics.production.activeJobsCount} Runs`}
          variation={metrics.production.activeJobsVariation}
          trend={`${metrics.production.completedJobsCount} runs completed this period`}
          sparklineData={[6, 8, 7, 9, 10, metrics.production.activeJobsCount]}
          sparklineColor="amber"
          accent="amber"
          icon={Factory}
        />
      </div>

      {/* ROW 2: SALES PERFORMANCE (~65%) & PROJECT PIPELINE (~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* C. SALES PERFORMANCE CHART (8 of 12 cols = 66.7%) */}
        <Card className="lg:col-span-8 p-6 space-y-4 border border-border-strong/70 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                Sales Performance
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Monthly quoted commercial pipeline vs. actual signed purchase orders (MUR)
              </p>
            </div>

            {/* Chart Legends */}
            <div className="flex items-center gap-4 text-xs shrink-0">
              <span className="flex items-center gap-1.5 font-medium text-text-primary">
                <span className="w-3 h-3 rounded-sm bg-[#119A94]" /> Quoted Value
              </span>
              <span className="flex items-center gap-1.5 font-medium text-text-primary">
                <span className="w-3 h-3 rounded-sm bg-[#6E4A9E]" /> Signed Revenue (Won)
              </span>
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="w-3 h-0.5 bg-[#A0AFA9]" /> Previous Period
              </span>
            </div>
          </div>

          {/* Area & Line Chart Component */}
          <div className="pt-2">
            <AreaLineChart data={metrics.monthlySalesTrend} height={230} />
          </div>
        </Card>

        {/* D. PROJECT STATUS DISTRIBUTION / PIPELINE (4 of 12 cols = 33.3%) */}
        <Card className="lg:col-span-4 p-6 space-y-4 border border-border-strong/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                  Project Pipeline
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Workflow stage distribution
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('Projects')}
                className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Donut Chart Component */}
            <div className="pt-4 flex justify-center">
              <DonutChart
                data={metrics.pipelineStages}
                centerLabel="Projects"
                size={170}
                thickness={20}
                onSegmentClick={() => onNavigateTab('Projects')}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border-subtle/80 flex items-center justify-between text-xs text-text-secondary">
            <span>Commercial Conversion:</span>
            <span className="font-mono font-bold text-brand-primary">
              {metrics.sales.conversionRate}% PO Win Rate
            </span>
          </div>
        </Card>

      </div>

      {/* ROW 3: TOP CLIENTS (~50%) & RECENT ACTIVITY (~50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* E. TOP CLIENTS */}
        <Card className="p-6 space-y-4 border border-border-strong/70 shadow-sm">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                Top Client Accounts
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Highest commercial value generation for {brand}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('Clients')}
              className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-0.5"
            >
              Directory <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 pt-1">
            {metrics.topClients.map((client, idx) => (
              <div
                key={client.id || idx}
                onClick={() => onOpenClient(client.id)}
                className="group cursor-pointer p-2 rounded-lg hover:bg-bg-secondary/60 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-brand-primary-light text-brand-primary-dark flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-text-primary group-hover:text-brand-primary transition-colors truncate">
                      {client.name}
                    </span>
                    <span className="text-[10px] text-text-muted hidden sm:inline">
                      ({client.industry})
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-text-primary">
                      Rs {client.valueMur.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Comparison Bar */}
                <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${client.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* F. RECENT ACTIVITY TIMELINE */}
        <Card className="p-6 space-y-4 border border-border-strong/70 shadow-sm">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                Recent Business Activity
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Live chronological updates across commercial and plant operations
              </p>
            </div>
            <Badge variant="brand">Real-time Feed</Badge>
          </div>

          <div className="space-y-3 pt-1">
            {activities.slice(0, 5).map((act, idx) => (
              <div
                key={act.id || idx}
                className="flex items-start justify-between text-xs pb-3 border-b border-border-subtle/50 last:border-b-0 last:pb-0"
              >
                <div className="space-y-0.5 min-w-0 pr-3">
                  <p className="font-semibold text-text-primary truncate">{act.title}</p>
                  <p className="text-text-secondary text-[11px] line-clamp-1">{act.description}</p>
                  {act.actor && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-text-muted mt-0.5">
                      <User className="w-3 h-3" /> By {act.actor}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-text-muted shrink-0 whitespace-nowrap bg-bg-secondary px-2 py-0.5 rounded">
                  {act.timestamp}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* ROW 4: G. URGENT ITEMS / UPCOMING TASKS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-color-warning" /> Urgent Operational Items & Approvals
          </h3>
          <span className="text-[11px] text-text-secondary font-medium">4 items requiring action</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateTab('Quotations')}
            className="p-4 rounded-xl border border-color-warning/40 bg-color-warning/5 hover:border-color-warning hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-color-warning">Quotation Awaiting PO</span>
              <span className="text-[10px] text-color-warning font-mono">Yesterday</span>
            </div>
            <h4 className="text-xs font-bold text-text-primary group-hover:text-color-warning transition-colors line-clamp-1">
              Le Supermarché du Nord
            </h4>
            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">
              QUO-EXP-2026-0101 (Rs 166,750) approved internally, awaiting client signature.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('Design')}
            className="p-4 rounded-xl border border-[#6E4A9E]/40 bg-[#6E4A9E]/5 hover:border-[#6E4A9E] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E4A9E]">Artwork Approval</span>
              <span className="text-[10px] text-[#6E4A9E] font-mono">2 hrs ago</span>
            </div>
            <h4 className="text-xs font-bold text-text-primary group-hover:text-[#6E4A9E] transition-colors line-clamp-1">
              QuickBite 8-Color Photo Carrier
            </h4>
            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">
              Requires flexographic repeat check and digital proof sign-off before cylinder mounting.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('Projects')}
            className="p-4 rounded-xl border border-brand-primary/40 bg-brand-primary/5 hover:border-brand-primary hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">High-Priority Request</span>
              <span className="text-[10px] text-brand-primary font-mono">4 hrs ago</span>
            </div>
            <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-primary transition-colors line-clamp-1">
              AgriFertilizer 2,750kg Film
            </h4>
            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">
              Heavy gauge UV masterbatch formulation enquiry awaiting technical validation.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('Design')}
            className="p-4 rounded-xl border border-color-success/40 bg-color-success/5 hover:border-color-success hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-color-success">Proof Ready for Client</span>
              <span className="text-[10px] text-color-success font-mono">1 day ago</span>
            </div>
            <h4 className="text-xs font-bold text-text-primary group-hover:text-color-success transition-colors line-clamp-1">
              Phoenix Beverages 5-Color Proof
            </h4>
            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">
              Shrink film high-opacity white backing approved by prepress, ready for dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
