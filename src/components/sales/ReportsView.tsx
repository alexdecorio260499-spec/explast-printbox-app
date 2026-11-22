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
import { ConversionFunnel } from '../ui/charts/ConversionFunnel';
import { DonutChart } from '../ui/charts/DonutChart';
import {
  TrendingUp,
  DollarSign,
  BarChart,
  Factory,
  Layers,
  Palette,
  Users,
  Download,
  Filter,
  Lightbulb,
  Sparkles,
  ChevronRight,
  Printer,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';

interface ReportsViewProps {
  brand: string;
  currentUser?: AppUser;
}

export function ReportsView({ brand: initialBrand, currentUser }: ReportsViewProps) {
  const [period, setPeriod] = useState<'30d' | '90d' | 'ytd' | 'custom'>('ytd');
  const [salespersonFilter, setSalespersonFilter] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);

  const isAdmin = currentUser?.role === 'admin';
  const effectiveSalesperson = isAdmin
    ? (salespersonFilter === 'all' ? undefined : salespersonFilter)
    : currentUser?.name;

  // Retrieve comprehensive data from central analytics engine
  const metrics = DemoService.getAnalyticsMetrics({
    salespersonName: effectiveSalesperson,
    period,
    brand: selectedBrand,
  });

  const periodDisplayNames: Record<string, string> = {
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    ytd: 'Year to Date',
    custom: 'Custom Date Range (Oct 2025 – Present)',
  };

  const isExplast = selectedBrand === 'Explast';

  return (
    <div className="space-y-8 animate-in fade-in duration-300 print:p-0">
      
      {/* 4.A. REPORTS HEADER & FILTER TOOLBAR */}
      <PageHeader
        eyebrow={isAdmin ? 'Enterprise Business Intelligence & Detailed Analytics' : 'Sales Representative Portfolio Analytics'}
        badgeText={selectedBrand === 'Global View' ? 'Consolidated Multi-Brand' : `${selectedBrand} Operations`}
        badgeVariant={isAdmin ? 'neutral' : 'brand'}
        title="Operations & Enterprise Commercial Reports"
        actions={
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Brand Filter */}
            <div className="flex items-center gap-1.5 bg-bg-card border border-border-strong/70 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <span className="text-text-muted text-[11px] font-medium">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-transparent text-xs text-text-primary font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Explast">Explast (Plastics)</option>
                <option value="PrintBox">PrintBox (Paper)</option>
                {isAdmin && <option value="Global View">Global Consolidated View</option>}
              </select>
            </div>

            {/* Sales Representative Filter */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 bg-bg-card border border-border-strong/70 rounded-lg px-2.5 py-1.5 shadow-2xs">
                <span className="text-text-muted text-[11px] font-medium">Sales Rep:</span>
                <select
                  value={salespersonFilter}
                  onChange={(e) => setSalespersonFilter(e.target.value)}
                  className="bg-transparent text-xs text-text-primary font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Sales Representatives</option>
                  <option value="Alex L.">Alex L.</option>
                  <option value="Sunil R.">Sunil R.</option>
                  <option value="Sarah M.">Sarah M.</option>
                </select>
              </div>
            )}

            {/* Period Selector */}
            <div className="bg-bg-card border border-border-strong/70 rounded-lg p-1 flex shadow-2xs">
              {(['30d', '90d', 'ytd', 'custom'] as const).map((pKey) => (
                <button
                  key={pKey}
                  type="button"
                  onClick={() => setPeriod(pKey)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    period === pKey
                      ? 'bg-brand-primary text-white font-semibold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  {pKey === '30d' ? '30 Days' : pKey === '90d' ? '90 Days' : pKey === 'ytd' ? 'Year to Date' : 'Custom'}
                </button>
              ))}
            </div>

            {/* Export PDF Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="bg-bg-card border-border-strong shadow-2xs hover:bg-bg-secondary"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
            </Button>
          </div>
        }
      />

      {/* 4.B. REPORT KPI CARDS (ROW 1 - 4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

        <KPICard
          label="Signed Revenue (Won)"
          value={`Rs ${metrics.sales.acceptedQuotationValue.toLocaleString()}`}
          variation={metrics.sales.revenueVariation}
          trend={`${metrics.sales.acceptedCount} confirmed purchase orders`}
          sparklineData={metrics.sales.revenueSparkline}
          sparklineColor="purple"
          accent="purple"
          icon={DollarSign}
        />

        <KPICard
          label="Commercial Win Rate"
          value={`${metrics.sales.conversionRate}%`}
          variation={metrics.sales.conversionVariation}
          trend={`${metrics.sales.acceptedCount} of ${metrics.sales.totalQuotationsCount} proposals converted`}
          sparklineData={[56, 61, 59, 64, 65, metrics.sales.conversionRate]}
          sparklineColor="emerald"
          accent="success"
          icon={BarChart}
        />

        <KPICard
          label="Active Plant Orders"
          value={`${metrics.production.activeJobsCount} Runs`}
          variation={metrics.production.activeJobsVariation}
          trend={`${metrics.production.completedJobsCount} runs completed this period`}
          sparklineData={[7, 9, 8, 10, 11, metrics.production.activeJobsCount]}
          sparklineColor="amber"
          accent="amber"
          icon={Factory}
        />
      </div>

      {/* 4.C. ROW 2: REVENUE & SALES ANALYTICS (~65%) & CONVERSION FUNNEL (~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* REVENUE & SALES PERFORMANCE CHART (8 of 12 cols = 66.7%) */}
        <Card className="lg:col-span-8 p-6 space-y-4 border border-border-strong/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                  Revenue & Sales Analytics
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Quoted commercial pipeline vs signed revenue over time ({periodDisplayNames[period]})
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs shrink-0">
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <span className="w-3 h-3 rounded-sm bg-[#119A94]" /> Quoted Value
                </span>
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <span className="w-3 h-3 rounded-sm bg-[#6E4A9E]" /> Signed Revenue
                </span>
                <span className="flex items-center gap-1.5 text-text-muted">
                  <span className="w-3 h-0.5 bg-[#A0AFA9]" /> Previous Period
                </span>
              </div>
            </div>

            {/* Interactive SVG Area Chart */}
            <div className="pt-3">
              <AreaLineChart data={metrics.monthlySalesTrend} height={230} />
            </div>
          </div>

          {/* Period Comparison Highlight Bar */}
          <div className="pt-3 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-bg-secondary/40 p-2.5 rounded-lg border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-text-muted block">Current Range Quoted</span>
              <span className="font-mono text-sm font-bold text-brand-primary">
                Rs {metrics.sales.totalQuotationValue.toLocaleString()}
              </span>
            </div>
            <div className="bg-bg-secondary/40 p-2.5 rounded-lg border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-text-muted block">Signed Order Revenue</span>
              <span className="font-mono text-sm font-bold text-[#6E4A9E]">
                Rs {metrics.sales.acceptedQuotationValue.toLocaleString()}
              </span>
            </div>
            <div className="bg-bg-secondary/40 p-2.5 rounded-lg border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-text-muted block">Prior Period Comparison</span>
              <span className="font-mono text-sm font-bold text-[#4F8F68]">
                +16.3% Net Growth
              </span>
            </div>
          </div>
        </Card>

        {/* 4.D. QUOTATION CONVERSION FUNNEL (4 of 12 cols = 33.3%) */}
        <Card className="lg:col-span-4 p-6 space-y-4 border border-border-strong/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-border-subtle pb-3">
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                Quotation Conversion Funnel
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Drop-off rates from Enquiry to Production Release
              </p>
            </div>

            <div className="pt-3">
              <ConversionFunnel stages={metrics.conversionFunnel} />
            </div>
          </div>

          <div className="text-[11px] text-text-muted pt-2 border-t border-border-subtle/60 flex items-center justify-between">
            <span>Average Deal Cycle:</span>
            <span className="font-mono font-semibold text-text-primary">8.4 Days from Inquiry</span>
          </div>
        </Card>

      </div>

      {/* 4.E & 4.F. ROW 3: MATERIAL FAMILY (~50%) & PRINTING COMPLEXITY (~50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Material Family Distribution */}
        <Card className="p-6 space-y-4 border border-border-strong/70 shadow-sm">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                {isExplast ? 'Polymer Material Family Distribution' : 'Paper Packaging Material Categories'}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {isExplast ? 'LDPE vs MDPE vs PP Extrusion Volumes' : 'Kraft Board, Fluting, Bleached and Rigid Substrates'}
              </p>
            </div>
            <Layers className="w-4 h-4 text-brand-primary" />
          </div>

          <div className="space-y-3.5 pt-1">
            {isExplast ? (
              Object.entries(metrics.products.materialCounts).map(([family, count]) => {
                const total = Object.values(metrics.products.materialCounts).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={family} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-text-primary">
                        {family === 'LDPE' ? 'LDPE (Low Density Polyethylene)' : family === 'MDPE' ? 'MDPE (Medium Density Film)' : 'PP (Polypropylene - Elpro / Polimaxx)'}
                      </span>
                      <span className="font-mono text-text-secondary">
                        {count} Runs ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              Object.entries(metrics.products.printboxPaperCounts).map(([cat, count]) => {
                const total = Object.values(metrics.products.printboxPaperCounts).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-text-primary">{cat}</span>
                      <span className="font-mono text-text-secondary">{count} Batches ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Printing & Color Complexity */}
        <Card className="p-6 space-y-4 border border-border-strong/70 shadow-sm">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                {isExplast ? 'Flexographic Printing & Colour Channels' : 'Offset & Screen Printing Specifications'}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {isExplast ? 'Distribution from unprinted plain film to 8-colour HD flexo' : 'CMYK process vs Pantone spot colors & finishes'}
              </p>
            </div>
            <Palette className="w-4 h-4 text-[#6E4A9E]" />
          </div>

          <div className="space-y-3.5 pt-1">
            {Object.entries(
              isExplast ? metrics.products.colorDistribution : metrics.products.printboxColorDistribution
            ).map(([category, count]) => {
              const totalObj = isExplast ? metrics.products.colorDistribution : metrics.products.printboxColorDistribution;
              const total = Object.values(totalObj).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text-primary">{category}</span>
                    <span className="font-mono text-text-secondary">{count} Jobs ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6E4A9E] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* 4.G. ROW 4: PLANT FLOOR THROUGHPUT BY MANUFACTURING STAGE (FULL WIDTH) */}
      <Card className="p-6 space-y-4 border border-border-strong/70 shadow-sm">
        <div className="flex justify-between items-center border-b border-border-subtle pb-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">
              Plant Floor Throughput by Manufacturing Stage
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {isExplast
                ? 'Active order distribution across Extrusion, Flexo Printing, Bag Sealing / Slitting, and Quality Control'
                : 'Active production flow across Pre-flight, Stock Cut, Offset Press, Die-Cutting, and Folding'}
            </p>
          </div>
          <Badge variant="brand">MES Factory Floor</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {Object.entries(isExplast ? metrics.production.jobsByStage : metrics.production.jobsByStagePrintbox).map(
            ([stage, count], idx) => {
              const total = Object.values(
                isExplast ? metrics.production.jobsByStage : metrics.production.jobsByStagePrintbox
              ).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div
                  key={stage}
                  className="p-3.5 bg-bg-secondary/50 rounded-xl border border-border-subtle hover:border-brand-primary transition-colors text-center flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate">
                    {stage.replace('_', ' ')}
                  </span>
                  <p className="font-mono text-2xl font-bold text-text-primary my-1.5">{count}</p>
                  <div className="flex items-center justify-between text-[10px] text-text-secondary pt-1 border-t border-border-subtle/50">
                    <span>Share:</span>
                    <span className="font-mono font-semibold text-brand-primary">{pct}%</span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </Card>

      {/* 4.H & 4.I. ROW 5: SALES REPRESENTATIVE PERFORMANCE (~50%) & BUSINESS INSIGHTS (~50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Representative Performance Ranking */}
        <Card className="p-6 space-y-4 border border-border-strong/70 shadow-sm">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                Sales Representative Performance Ranking
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Proposals issued, purchase orders won, and closed commercial value
              </p>
            </div>
            <Users className="w-4 h-4 text-brand-primary" />
          </div>

          <div className="space-y-3.5 pt-1">
            {metrics.salesRepsList.map((rep, idx) => (
              <div
                key={rep.name}
                className="p-3 rounded-lg border border-border-subtle bg-bg-secondary/20 hover:bg-bg-secondary/60 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {rep.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">{rep.name}</h4>
                      <span className="text-[10px] text-text-muted">{rep.quotesCount} Quotes • {rep.wonCount} Won</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-brand-primary block">
                      Rs {rep.acceptedValue.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-color-success">
                      {rep.winRate}% Win Rate
                    </span>
                  </div>
                </div>

                {/* Performance Comparison Bar */}
                <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((rep.acceptedValue / 1500000) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 4.I. BUSINESS INSIGHTS & KEY TAKEAWAYS */}
        <Card className="p-6 space-y-4 border border-border-strong/70 shadow-sm">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                Executive Business Intelligence & Key Takeaways
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Automated analytical observations derived from current operational datasets
              </p>
            </div>
            <Lightbulb className="w-4 h-4 text-color-warning" />
          </div>

          <div className="space-y-3 pt-1">
            {metrics.businessInsights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-border-subtle bg-bg-card hover:border-brand-primary/60 transition-colors flex items-start gap-3"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    insight.type === 'highlight'
                      ? 'bg-brand-primary-light text-brand-primary'
                      : insight.type === 'trend'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-xs font-bold text-text-primary truncate">
                      {insight.title}
                    </h4>
                    {insight.metric && (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-bg-secondary text-text-primary shrink-0">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {insight.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
}
