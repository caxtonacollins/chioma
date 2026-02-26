'use client';

import React, { useMemo, useState } from 'react';
import { Receipt, Download, FileText, Filter } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import TransactionsTable from '@/components/landlord-dashboard/TransactionsTable';
import SecurityDepositsSection, {
  getActiveDeposits,
} from '@/components/landlord-dashboard/SecurityDepositsSection';
import {
  MOCK_TRANSACTIONS,
  type Transaction,
  type TransactionType,
} from '@/lib/transactions-data';
import {
  exportTransactionsToCsv,
  exportTransactionsToPdf,
} from '@/lib/export-transactions';
import { format, subMonths, startOfDay, endOfDay, parseISO } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import KPICard from '@/components/landlord-dashboard/KPICard';

const TRANSACTION_TYPES: TransactionType[] = [
  'Rent',
  'Deposit',
  'Refund',
  'Service Fee',
];

const PROPERTIES = Array.from(
  new Set(MOCK_TRANSACTIONS.map((t) => t.propertyName)),
).sort();

export default function FinancialsPage() {
  const [dateFrom, setDateFrom] = useState<string>(
    format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
  );
  const [dateTo, setDateTo] = useState<string>(
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);

  const filteredTransactions = useMemo(() => {
    let list: Transaction[] = [...MOCK_TRANSACTIONS];
    const from = dateFrom ? startOfDay(parseISO(dateFrom)).getTime() : 0;
    const to = dateTo ? endOfDay(parseISO(dateTo)).getTime() : Infinity;
    list = list.filter((t) => {
      const tTime = new Date(t.date).getTime();
      if (tTime < from || tTime > to) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (propertyFilter !== 'all' && t.propertyName !== propertyFilter)
        return false;
      return true;
    });
    list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return list;
  }, [dateFrom, dateTo, typeFilter, propertyFilter]);

  const activeDeposits = useMemo(
    () => getActiveDeposits(MOCK_TRANSACTIONS),
    [],
  );

  const handleExportCsv = () => {
    exportTransactionsToCsv(filteredTransactions);
  };

  const handleExportPdf = () => {
    exportTransactionsToPdf(
      filteredTransactions,
      'Chioma – Transaction & Payment History',
    );
  };

  // Mock data for chart
  const chartData = [
    { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-neutral-900 tracking-tight'>
            Transaction & Payment History
          </h1>
          <p className='text-neutral-500 mt-1'>
            View payments, security deposits, and blockchain ledger links
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setShowFilters((v) => !v)}
            className='inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors'
          >
            <Filter size={18} />
            {showFilters ? 'Hide filters' : 'Show filters'}
          </button>
          <button
            type='button'
            onClick={handleExportCsv}
            className='inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors'
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            type='button'
            onClick={handleExportPdf}
            className='inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue-dark transition-colors shadow-sm'
          >
            <FileText size={18} />
            Export PDF
          </button>
        </div>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
        <KPICard title='Total Revenue (YTD)' value={10000} icon={< Receipt />} />
        <KPICard title='Pending Payouts' value={5000} icon={<Wallet />} />
        <KPICard title='Platform Fees Remitted' value={2000} icon={<Shield />} />
      </div>
      <div className='bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden'>
        <AreaChart width={700} height={400} data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis /
          >
          <Tooltip />
          <Area type='monotone' dataKey='uv' stroke='#8884d8' fill='#8884d8' />
        </AreaChart>
      </div>
      <div className='bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden'>
        <div className='px-6 py-4 border-b border-neutral-100 bg-emerald-50/50 flex items-center gap-2'>
          <h2 className='text-lg font-semibold text-neutral-900'>Recent Transactions</h2>
        </div>
        <div className='divide-y divide-neutral-100'>
          {filteredTransactions.map((t) => (
            <div key={t.id} className='px-6 py-4 flex flex-wrap items-center justify-between gap-4 hover:bg-neutral-50/80 transition-colors'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700'>
                  <Wallet size={20} />
                </div>
                <div>
                  <p className='font-medium text-neutral-900'>{t.propertyName}</p>
                  <p className='text-sm text-neutral-500 mt-0.5'>{format(new Date(t.date), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-neutral-900'>{t.amount} {t.currency}</p>
                <p className='text-xs text-neutral-500'>
                  {t.type === 'Rent' ? 'Rent Collected' : t.type === 'Deposit' ? 'Deposit' : 'Refund'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
