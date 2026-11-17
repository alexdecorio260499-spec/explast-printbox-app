'use client';

import React, { useState } from 'react';
import { DemoService } from '@/lib/sales/demo-service';
import { AppUser } from '@/types/demo';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  BarChart,
  TrendingUp,
  Users,
  Layers,
  Factory,
  Calendar,
  Filter,
  Download,
  DollarSign,
  PieChart,
  Shield,
  UserCheck,
} from 'lucide-react';

interface ReportsViewProps {
  brand: string;
  currentUser?: AppUser;
}

export function ReportsView({ brand, currentUser }: ReportsViewProps) {
  const [period, setPeriod] = useState<'30d' | '90d' | 'ytd'>('ytd');
  const [materialFilter, setMaterialFilter] = useState<string>('all');
  const [salespersonFilter, setSalespersonFilter] = useState<string>('all');

  const isAdmin = currentUser?.role === 'admin';
  const effectiveSalesperson = isAdmin
    ? (salespersonFilter === 'all' ? undefined : salespersonFilter)
    : currentUser?.name;

  const metrics = DemoService.getAnalyticsMetrics(effectiveSalesperson);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {isAdmin ? 'Enterprise Business Intelligence' : 'Sales Representative Portfolio Analytics'}
            </h2>
            <Badge variant={isAdmin ? 'neutral' : 'brand'}>
              {isAdmin ? 'Global Factory View' : `Assigned: ${currentUser?.name || 'Sales Rep'}`}
            </Badge>
          </div>
          <h1 className="text-2xl font-medium text-text-primary">
            {isAdmin
              ? 'Operations & Enterprise Commercial Reports'
              : `${currentUser?.name || 'Sales'} — Performance & Pipeline Reports`}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Salesperson filter for admin */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 bg-bg-card border border-border-subtle rounded-lg px-2.5 py-1">
              <span className="text-text-muted text-[11px] font-medium">Filter Rep:</span>
              <select
                value={salespersonFilter}
                onChange={(e) => setSalespersonFilter(e.target.value)}
                className="bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer"
              >
                <option value="all">All Sales Representatives</option>
                <option value="Alex L.">Alex L.</option>
                <option value="Sunil R.">Sunil R.</option>
                <option value="Sarah M.">Sarah M.</option>
              </select>
            </div>
          )}

          {/* Period selector */}
          <div className="bg-bg-card border border-border-subtle rounded-lg p-1 flex">
            {(['30d', '90d', 'ytd'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  period === p ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : 'Year to Date'}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* TOP KPI BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Quoted Value</span>
            <TrendingUp className="w-4 h-4 text-brand-primary" />
          </div>
          <p className="font-mono text-2xl font-bold text-text-primary mt-2">
            Rs {metrics.sales.totalQuotationValue.toLocaleString()}
          </p>
          <span className="text-xs text-text-secondary mt-1 block">Across {metrics.sales.totalQuotationsCount} formal proposals</span>
        </Card>

        <Card className="p-5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Signed Revenue (Won)</span>
            <DollarSign className="w-4 h-4 text-color-success" />
          </div>
          <p className="font-mono text-2xl font-bold text-color-success mt-2">
            Rs {metrics.sales.acceptedQuotationValue.toLocaleString()}
          </p>
          <span className="text-xs text-text-secondary mt-1 block">{metrics.sales.acceptedCount} customer purchase orders</span>
        </Card>

        <Card className="p-5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Commercial Win Rate</span>
            <BarChart className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-mono text-2xl font-bold text-purple-600 mt-2">
            {metrics.sales.conversionRate}%
          </p>
          <span className="text-xs text-text-secondary mt-1 block">High conversion on repeat formulations</span>
        </Card>

        <Card className="p-5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Active Plant Orders</span>
            <Factory className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-mono text-2xl font-bold text-emerald-600 mt-2">
            {metrics.production.activeJobsCount} Runs
          </p>
          <span className="text-xs text-text-secondary mt-1 block">{metrics.production.completedJobsCount} runs completed this month</span>
        </Card>
      </div>

      {/* SECTION 1: MATERIALS & FORMULATION DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Material Family Distribution */}
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Material Family Distribution</h3>
              <p className="text-xs text-text-secondary">LDPE vs MDPE vs PP Requests</p>
            </div>
            <Layers className="w-4 h-4 text-brand-primary" />
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(metrics.products.materialCounts).map(([family, count]) => {
              const total = Object.values(metrics.products.materialCounts).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={family} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-text-primary">{family} Family</span>
                    <span className="font-mono text-text-secondary">{count} Requests ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Plain vs Printed & Color Distribution */}
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Printing & Color Complexity</h3>
              <p className="text-xs text-text-secondary">Flexo printing color channels</p>
            </div>
            <PieChart className="w-4 h-4 text-purple-600" />
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(metrics.products.colorDistribution).map(([category, count]) => {
              const total = Object.values(metrics.products.colorDistribution).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-text-primary">{category}</span>
                    <span className="font-mono text-text-secondary">{count} Jobs ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* SECTION 2: PRODUCTION STAGES & PLANT FLOOR THROUGHPUT */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Plant Floor Throughput by Manufacturing Stage</h3>
            <p className="text-xs text-text-secondary">Active distribution across Extrusion, Printing, Conversion, and QC</p>
          </div>
          <Factory className="w-4 h-4 text-emerald-600" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {Object.entries(metrics.production.jobsByStage).map(([stage, count]) => (
            <div key={stage} className="p-3 bg-bg-secondary/40 rounded-lg border border-border-subtle text-center">
              <span className="text-[10px] font-bold uppercase text-text-muted">
                {stage.replace('_', ' ')}
              </span>
              <p className="font-mono text-xl font-bold text-text-primary mt-1">{count}</p>
              <span className="text-[10px] text-text-secondary">Jobs</span>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 3: CUSTOMER INDUSTRIES & SALESPERSON LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customer Accounts by Industry */}
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Customer Base by Industry Sector</h3>
              <p className="text-xs text-text-secondary">{metrics.customers.totalCustomers} Active Client Accounts</p>
            </div>
            <Users className="w-4 h-4 text-brand-primary" />
          </div>

          <div className="space-y-2.5 pt-2">
            {Object.entries(metrics.customers.industryCounts).map(([industry, count]) => (
              <div key={industry} className="flex justify-between items-center p-2 rounded bg-bg-secondary/30 text-xs">
                <span className="font-medium text-text-primary">{industry}</span>
                <span className="font-mono font-bold text-brand-primary">{count} Accounts</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Sales Representatives Performance or Personal Benchmarks */}
        {isAdmin ? (
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Commercial Representative Comparison</h3>
                <p className="text-xs text-text-secondary">Quotations issued and won volume across all sales reps</p>
              </div>
              <TrendingUp className="w-4 h-4 text-color-success" />
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(metrics.salesReps).map(([rep, data]) => (
                <div key={rep} className="p-3 bg-bg-secondary/30 rounded-lg border border-border-subtle flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                      {rep.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{rep}</p>
                      <p className="text-text-muted text-[11px]">{data.quotes} Quotations Issued</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-text-muted uppercase">Won Revenue</span>
                    <p className="font-mono font-bold text-color-success">
                      Rs {data.acceptedValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Personal Commercial Performance</h3>
                <p className="text-xs text-text-secondary">Metrics scoped to {currentUser?.name || 'My Portfolio'}</p>
              </div>
              <TrendingUp className="w-4 h-4 text-color-success" />
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-4 bg-brand-primary/10 rounded-lg border border-brand-primary/20 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Won Revenue Signed</span>
                  <p className="font-mono text-2xl font-bold text-brand-primary mt-0.5">
                    Rs {metrics.sales.acceptedQuotationValue.toLocaleString()}
                  </p>
                </div>
                <Badge variant="brand">{metrics.sales.conversionRate}% Win Rate</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-bg-secondary/40 rounded-lg border border-border-subtle">
                  <span className="text-[10px] text-text-muted uppercase">Total Quotes Issued</span>
                  <p className="font-mono text-lg font-bold text-text-primary mt-1">{metrics.sales.totalQuotationsCount}</p>
                  <span className="text-[10px] text-text-secondary">Commercial proposals</span>
                </div>
                <div className="p-3 bg-bg-secondary/40 rounded-lg border border-border-subtle">
                  <span className="text-[10px] text-text-muted uppercase">Pending Pipeline</span>
                  <p className="font-mono text-lg font-bold text-color-warning mt-1">Rs {metrics.sales.pendingQuotationValue.toLocaleString()}</p>
                  <span className="text-[10px] text-text-secondary">{metrics.sales.pendingCount} awaiting approval</span>
                </div>
              </div>

              <div className="p-3 bg-bg-secondary/20 rounded-lg border border-border-subtle flex items-center justify-between text-text-secondary text-[11px]">
                <span>Active Assigned Customer Accounts</span>
                <span className="font-mono font-bold text-text-primary">{metrics.customers.totalCustomers} Accounts</span>
              </div>
            </div>
          </Card>
        )}

      </div>

    </div>
  );
}
