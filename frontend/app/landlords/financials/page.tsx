'use client';

import React, { useMemo, useState } from 'react';
import { Receipt, Download, FileText, Filter, Wallet, Shield } from 'lucide-react';
import {
  MOCK_TRANSACTIONS,
  type Transaction,
} from '@/lib/transactions-data';
import {
  exportTransactionsToCsv,
  exportTransactionsToPdf,
} from '@/lib/export-transactions';
import { format, subMonths, startOfDay, endOfDay, parseISO } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import KPICard from '@/components/landlord-dashboard/KPICard';
import { getActiveDeposits } from '@/components/landlord-dashboard/SecurityDepositsSection';

export default function FinancialsPage() {
  const dateFrom = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
  const dateTo = format(new Date(), 'yyyy-MM-dd');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);

  const filteredTransactions = useMemo(() => {
    let list: Transaction[] = [...MOCK_TRANSACTIONS];
    const from = dateFrom ? startOfDay(parseISO(dateFrom)).getTime() : 0;
    const to = dateTo ? endOfDay(parseISO(dateTo)).getTime() : Infinity;
    list = list.filter((t) => {
      const tTime = new Date(t.date).getTime();
      if (tTime < from || tTime > to) return false;
      if (propertyFilter !== 'all' && t.propertyName !== propertyFilter)
        return false;
      return true;
    });
    list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return list;
  }, [dateFrom, dateTo, propertyFilter]);

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
            className='inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors'
          >
            <FileText size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {showFilters && (
        <div className='flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200'>
          <div className='flex items-center gap-2'>
            <Wallet size={18} className='text-neutral-500' />
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className='text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white'
            >
              <option value='all'>All Properties</option>
              {Array.from(new Set(MOCK_TRANSACTIONS.map((t) => t.propertyName))).sort().map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className='flex items-center gap-2'>
            <Shield size={18} className='text-neutral-500' />
            <span className='text-sm text-neutral-600'>
              {activeDeposits.length} active deposit{activeDeposits.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <KPICard
          title='Total Income'
          value={`₦${filteredTransactions
            .filter((t) => t.type === 'Rent')
            .reduce((sum, t) => sum + t.amount, 0)
            .toLocaleString()}`}
          icon={<Receipt size={20} />}
        />
        <KPICard
          title='Active Deposits'
          value={`₦${activeDeposits
            .reduce((sum, t) => sum + t.amount, 0)
            .toLocaleString()}`}
          icon={<Shield size={20} />}
        />
        <KPICard
          title='Transactions'
          value={filteredTransactions.length.toString()}
          icon={<Wallet size={20} />}
        />
      </div>

      <div className='bg-white rounded-xl border border-neutral-200 p-6'>
        <h2 className='text-lg font-semibold text-neutral-800 mb-4'>Revenue Over Time</h2>
        <AreaChart width={600} height={300} data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis />
          <Tooltip />
          <Area type='monotone' dataKey='uv' stroke='#8884d8' fill='#8884d8' />
          <Area type='monotone' dataKey='pv' stroke='#82ca9d' fill='#82ca9d' />
        </AreaChart>
      </div>

      <div className='bg-white rounded-xl border border-neutral-200 overflow-hidden'>
        <div className='px-6 py-4 border-b border-neutral-100'>
          <h2 className='text-lg font-semibold text-neutral-800'>Transaction History</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-neutral-50 text-neutral-500 uppercase text-xs'>
              <tr>
                <th className='px-6 py-3 text-left'>Date</th>
                <th className='px-6 py-3 text-left'>Property</th>
                <th className='px-6 py-3 text-left'>Type</th>
                <th className='px-6 py-3 text-right'>Amount</th>
                <th className='px-6 py-3 text-left'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-neutral-100'>
              {filteredTransactions.map((t) => (
                <tr key={t.id} className='hover:bg-neutral-50'>
                  <td className='px-6 py-4 text-neutral-600'>{t.date}</td>
                  <td className='px-6 py-4 text-neutral-800 font-medium'>{t.propertyName}</td>
                  <td className='px-6 py-4 text-neutral-600'>{t.type}</td>
                  <td className='px-6 py-4 text-right font-semibold'>₦{t.amount.toLocaleString()}</td>
                  <td className='px-6 py-4'>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      t.status === 'completed' ? 'bg-green-100 text-green-700' :
                      t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
